const fs = require('fs');

const getIPAddress = req => {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};
const deleteFiles = (funcLogger, filePaths) => {
  const logger = funcLogger.child({ filePaths });
  logger.info('Start deleting images');
  filePaths.forEach(filePath => {
    try {
      fs.unlinkSync(filePath);
      // eslint-disable-next-line no-empty
    } catch (e) {}
  });
};

module.exports = { getIPAddress, deleteFiles };
