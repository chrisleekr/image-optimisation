const { saveTempImageFile, compressImage } = require('../helpers/image');
const { deleteFiles } = require('../helpers/util');
const { handleValidationError, handleError, handleSuccessFile } = require('../helpers/response');

const postImage = async (req, res) => {
  const { log: logger } = req;

  const validationResponse = handleValidationError(req, res);
  if (validationResponse !== null) {
    return validationResponse;
  }

  let uploadedFile;

  try {
    // Move image
    const { image } = req.files;
    logger.info({ image }, 'Received image');

    uploadedFile = await saveTempImageFile(image);

    const imageResult = await compressImage(logger, uploadedFile.oldFilePath, uploadedFile.newPath);

    // Delete original image
    deleteFiles(logger, [uploadedFile.oldFilePath]);
    return handleSuccessFile(res, imageResult.destinationPath, {
      headers: {
        'X-Old-File-Size': imageResult.sourceImageInfo.bytes,
        'X-New-File-Size': imageResult.destinationImageInfo.bytes,
        'X-New-Img-Width': imageResult.destinationImageInfo.width,
        'X-New-Img-Height': imageResult.destinationImageInfo.height
      },
      logger,
      deleteFileAfterReturn: true
    });
  } catch (e) {
    logger.error(e, 'Optimisation failed');
    deleteFiles(logger, [uploadedFile.oldFilePath, uploadedFile.newFilePath]);

    return handleError(res, [
      {
        value: '',
        msg: e.message,
        param: 'general',
        location: 'body'
      }
    ]);
  }
};
module.exports = {
  postImage
};
