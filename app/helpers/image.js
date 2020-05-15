const baseDir = process.env.PWD;

const path = require('path');
const mkdirp = require('mkdirp');

const imageInfo = require('image-info');
const imagemin = require('imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminSvgo = require('imagemin-svgo');

const saveTempImageFile = async image => {
  const extension = path.extname(image.name);

  const oldPath = `${path.resolve(`${baseDir}/data/upload`)}/`;
  const newPath = `${path.resolve(`${baseDir}/data/output`)}/`;

  mkdirp.sync(oldPath);
  mkdirp.sync(newPath);

  const newFileName = `${
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }${extension}`;

  const oldFilePath = `${oldPath}${newFileName}`;
  const newFilePath = `${newPath}${newFileName}`;

  await image.mv(oldFilePath);

  return {
    extension,
    oldPath,
    oldFilePath,
    newPath,
    newFilePath
  };
};

const compressImage = async (funcLogger, filePath, outputPath) => {
  const logger = funcLogger.child({ filePath, outputPath });
  logger.info('Start compressing image');

  return imagemin([filePath], {
    destination: outputPath,
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

module.exports = { saveTempImageFile, compressImage };
