const fs = require('fs');

const { validationResult } = require('express-validator');
const { deleteFiles } = require('./util');

const emitValidationResponse = (res, errorArray) => {
  return res.status(422).json({
    success: false,
    status: 422,
    message: errorArray.length === 1 ? 'There is a validation error.' : 'There are validation errors.',
    data: errorArray
  });
};

const handleValidationError = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    return emitValidationResponse(res, errorArray);
  }
  return null;
};

const handleCustomValidationError = (res, errorArray) => {
  return emitValidationResponse(res, errorArray);
};

const handleError = (res, message) => {
  return res.status(500).json({
    success: false,
    status: 500,
    message,
    data: {}
  });
};

const handleSuccess = (res, message, data) => {
  return res.status(200).json({
    success: true,
    status: 200,
    message,
    data
  });
};

const handleNotFound = (res, message) => {
  return res.status(404).json({
    success: false,
    status: 404,
    message,
    data: {}
  });
};

const handleSuccessFile = (res, filePath, { headers = {}, logger = null, deleteFileAfterReturn = false }) => {
  if (fs.existsSync(filePath) === false) {
    logger.error({ filePath }, 'File does not exist.');
    return handleNotFound(res, 'File does not exist.');
  }

  return res.status(200).sendFile(filePath, { headers }, err => {
    if (err) {
      throw new Error(err);
    }

    if (deleteFileAfterReturn) {
      deleteFiles(logger, [filePath]);
    }
  });
};

const handleForbidden = (res, message) => {
  return res.status(403).json({
    success: false,
    status: 403,
    message,
    data: {}
  });
};

const handleRedirect = (res, status, url) => {
  return res.redirect(status, url);
};

const validateRequest = async (req, res, _options) => {
  // Handle validation error if the request is not valid
  const validationResponse = handleValidationError(req, res);
  if (validationResponse !== null) {
    return validationResponse;
  }

  return null;
};

module.exports = {
  handleValidationError,
  handleCustomValidationError,
  handleSuccess,
  handleSuccessFile,
  handleNotFound,
  handleForbidden,
  handleRedirect,
  handleError,
  validateRequest
};
