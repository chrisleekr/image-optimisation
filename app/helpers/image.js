const baseDir = process.env.PWD;

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const axios = require('axios');
const fileType = require('file-type');

const imageInfo = require('image-info');
const imagemin = require('imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminSvgo = require('imagemin-svgo');

const uploadPath = `${path.resolve(`${baseDir}/data/upload`)}/`;
const outputPath = `${path.resolve(`${baseDir}/data/output`)}/`;

mkdirp.sync(uploadPath);
mkdirp.sync(outputPath);

const generateRandomFileName = () =>
  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const saveRemoteImage = async (funcLogger, url) => {
  const logger = funcLogger.child({ func: 'saveRemoteImage', url });
  logger.info('Start saving remote image url');

  let newFileName = `${generateRandomFileName()}`;

  let uploadFilePath = `${uploadPath}${newFileName}`;
  let outputFilePath = `${outputPath}${newFileName}`;

  const response = await axios({
    method: 'get',
    url,
    responseType: 'arraybuffer'
  });

  fs.writeFileSync(uploadFilePath, response.data);

  // Determine extension based on the mime type
  const fileInfo = await fileType.fromFile(uploadFilePath);
  let extension = null;
  let mimeType = null;

  if (fileInfo) {
    extension = fileInfo.ext;
    mimeType = fileInfo.mime;
    newFileName = `${generateRandomFileName()}.${extension}`;

    const oldUploadFilePath = uploadFilePath;
    uploadFilePath = `${uploadPath}${newFileName}`;
    outputFilePath = `${outputPath}${newFileName}`;

    fs.renameSync(oldUploadFilePath, uploadFilePath);
  }

  logger.info('Finish saving remote image url');

  return {
    extension,
    mimeType,
    uploadPath,
    uploadFilePath,
    outputPath,
    outputFilePath
  };
};

const saveUploadedImage = async (funcLogger, image) => {
  const logger = funcLogger.child({ func: 'saveUploadedImage' });
  logger.info('Start compressing image');
  const extension = path.extname(image.name);

  const newFileName = `${generateRandomFileName()}${extension}`;

  const uploadFilePath = `${uploadPath}${newFileName}`;
  const outputFilePath = `${outputPath}${newFileName}`;

  await image.mv(uploadFilePath);

  return {
    extension,
    mimeType: image.mimetype,
    uploadPath,
    uploadFilePath,
    outputPath,
    outputFilePath
  };
};

const compressImage = async (funcLogger, filePath, destination) => {
  const logger = funcLogger.child({ func: 'compressImage', filePath, destination });
  logger.info('Start compressing image');

  return imagemin([filePath], {
    destination,
    plugins: [
      imageminJpegtran(),
      imageminJpegRecompress(),
      imageminPngquant({
        quality: [0.6, 0.8]
      }),
      imageminGifsicle(),
      imageminSvgo({
        plugins: [{ removeViewBox: false }]
      })
    ]
  }).then(async files => {
    if (files[0]) {
      const file = files[0];
      logger.info(
        { sourcePath: file.sourcePath, destinationPath: file.destinationPath },
        'Successfully to compress image'
      );
      file.sourceImageInfo = await new Promise((resolve, reject) => {
        imageInfo(file.sourcePath, (err, info) => {
          if (err) {
            logger.error({ err }, 'Failed to retrieve source image information');
            reject(new Error('Failed to retrieve source image information'));
          }
          logger.info({ info }, 'Retrieved source image information');
          resolve(info);
        });
      });

      file.destinationImageInfo = await new Promise((resolve, reject) => {
        imageInfo(file.destinationPath, (err, info) => {
          if (err) {
            logger.error({ err }, 'Failed to retrieve destination image information');
            reject(new Error('Failed to retrieve destination image information'));
          }
          logger.info({ info }, 'Retrieved destination image information');
          resolve(info);
        });
      });

      return file;
    }

    logger.info({ files }, 'Failed to compress image');
    return Promise.reject(new Error('Failed to compress image'));
  });
};

module.exports = { uploadPath, outputPath, generateRandomFileName, saveUploadedImage, saveRemoteImage, compressImage };
