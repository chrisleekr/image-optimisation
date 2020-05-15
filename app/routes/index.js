const { checkSchema } = require('express-validator');
const packageJson = require('../../package.json');

const imageController = require('../controllers/imageController');

const image = require('./validations/image');

module.exports = app => {
  app.route('/').get((_req, res) => {
    return res.status(200).send({
      success: true,
      status: 200,
      message: 'OK',
      data: {
        serverStatus: 'online',
        version: packageJson.version
      }
    });
  });

  app.route('/image').post([checkSchema(image.imagePost)], imageController.postImage);
};
