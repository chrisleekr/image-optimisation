const _ = require('lodash');
const { saveUploadedImage, saveRemoteImage } = require('../../../helpers/image');

const validateRequest = req => {
  if (_.get(req, 'files.image', null) === null && _.get(req, 'body.url', null) === null) {
    throw new Error('Image or URL must be provided.');
  }

  if (_.get(req, 'files.image', null) !== null && _.get(req, 'body.url', null) !== null) {
    throw new Error('Image and URL cannot be provided at the same time. Please post with image or URL.');
  }
};

const validateMimeType = mimeType => {
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif', 'image/webp'];
  if (allowedMimeTypes.includes(mimeType) === false) {
    return false;
  }

  return true;
};

module.exports = {
  image: {
    custom: {
      options: async (_value, { req }) => {
        const { log: logger } = req;
        validateRequest(req);

        // If image is not uploaded, then do not validate
        if (_.get(req, 'files.image', null) === null) {
          return true;
        }

        // Save image
        const uploadedFile = await saveUploadedImage(logger, req.files.image);
        logger.info({ uploadedFile }, 'Retrieved saveUploadedImage');

        // Validate mime type
        if (validateMimeType(uploadedFile.mimeType) === false) {
          throw new Error(`Uploaded image is not allowed.`);
        }

        req.uploadedFile = uploadedFile;

        return true;
      }
    }
  },
  url: {
    in: ['body'],
    custom: {
      options: async (url, { req }) => {
        const { log: logger } = req;

        validateRequest(req);

        // If url is not provided, then do not validate
        if (_.get(req, 'body.url', null) === null) {
          return true;
        }

        // Download image
        const uploadedFile = await saveRemoteImage(logger, url);
        logger.info({ url, uploadedFile }, 'Retrieved saveRemoteImage');

        // Validate mime type
        if (validateMimeType(uploadedFile.mimeType) === false) {
          throw new Error(`Provided image URL is not allowed.`);
        }

        req.uploadedFile = uploadedFile;

        return true;
      }
    }
  }
};
