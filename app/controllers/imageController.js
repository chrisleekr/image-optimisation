const { compressImage } = require('../helpers/image');
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
    uploadedFile = req.uploadedFile;

    logger.info({ uploadedFile }, 'Received image');

    const imageResult = await compressImage(logger, uploadedFile.uploadFilePath, uploadedFile.outputPath);

    // Delete original image
    deleteFiles(logger, [uploadedFile.uploadFilePath]);
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
    deleteFiles(logger, [uploadedFile.uploadFilePath, uploadedFile.outputFilePath]);

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
