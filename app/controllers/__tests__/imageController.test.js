const path = require('path');
const supertest = require('supertest');

const { app, server } = require('../../server');

describe('imageController', () => {
  let request;
  let response;

  beforeEach(async () => {
    request = supertest(app);
  });

  afterEach(async () => {
    await server.close();
  });

  describe('postImage', () => {
    describe('validation error', () => {
      describe('when image or url is not provided', () => {
        beforeEach(async () => {
          response = await request.post('/image');
        });

        it('retruns validation error', () => {
          expect(response.status).toBe(422);

          expect(response.text).toBe(
            JSON.stringify({
              success: false,
              status: 422,
              message: 'There are validation errors.',
              data: [
                {
                  msg: 'Image or URL must be provided.',
                  param: 'image',
                  location: 'body'
                },
                {
                  msg: 'Image or URL must be provided.',
                  param: 'url',
                  location: 'body'
                }
              ]
            })
          );
        });
      });

      describe('when image and url are provided together', () => {
        beforeEach(async () => {
          response = await request
            .post('/image')
            .attach('image', `${path.resolve(`${__dirname}/sample1.jpg`)}`)
            .field(
              'url',
              'https://raw.githubusercontent.com/chrisleekr/nodejs-image-optimisation/master/examples/sample99.jpg'
            );
        });

        it('retruns validation error', () => {
          expect(response.status).toBe(422);

          expect(response.text).toBe(
            JSON.stringify({
              success: false,
              status: 422,
              message: 'There are validation errors.',
              data: [
                {
                  msg: 'Image and URL cannot be provided at the same time. Please post with image or URL.',
                  param: 'image',
                  location: 'body'
                },
                {
                  value:
                    // eslint-disable-next-line max-len
                    'https://raw.githubusercontent.com/chrisleekr/nodejs-image-optimisation/master/examples/sample99.jpg',
                  msg: 'Image and URL cannot be provided at the same time. Please post with image or URL.',
                  param: 'url',
                  location: 'body'
                }
              ]
            })
          );
        });
      });

      describe('when image is provided in wrong field', () => {
        beforeEach(async () => {
          response = await request.post('/image').attach('non-image', `${path.resolve(`${__dirname}/sample1.jpg`)}`);
        });

        it('retruns validation error', () => {
          expect(response.status).toBe(422);

          expect(response.text).toBe(
            JSON.stringify({
              success: false,
              status: 422,
              message: 'There are validation errors.',
              data: [
                {
                  msg: 'Image or URL must be provided.',
                  param: 'image',
                  location: 'body'
                },
                {
                  msg: 'Image or URL must be provided.',
                  param: 'url',
                  location: 'body'
                }
              ]
            })
          );
        });
      });

      describe('when non image is provided', () => {
        beforeEach(async () => {
          response = await request.post('/image').attach('image', `${path.resolve(`${__dirname}/sample1.json`)}`);
        });

        it('retruns validation error', () => {
          expect(response.status).toBe(422);

          expect(response.text).toBe(
            JSON.stringify({
              success: false,
              status: 422,
              message: 'There is a validation error.',
              data: [
                {
                  msg: 'Uploaded image is not allowed.',
                  param: 'image',
                  location: 'body'
                }
              ]
            })
          );
        });
      });

      describe('when invalid url is provided', () => {
        beforeEach(async () => {
          response = await request
            .post('/image')
            .field(
              'url',
              'https://raw.githubusercontent.com/chrisleekr/nodejs-image-optimisation/master/examples/sample99.jpg'
            );
        });

        it('retruns validation error', () => {
          expect(response.status).toBe(422);

          expect(response.text).toBe(
            JSON.stringify({
              success: false,
              status: 422,
              message: 'There is a validation error.',
              data: [
                {
                  value:
                    // eslint-disable-next-line max-len
                    'https://raw.githubusercontent.com/chrisleekr/nodejs-image-optimisation/master/examples/sample99.jpg',
                  msg: 'Request failed with status code 404',
                  param: 'url',
                  location: 'body'
                }
              ]
            })
          );
        });
      });

      describe('when provided url is not an image', () => {
        beforeEach(async () => {
          response = await request.post('/image').field(
            'url',
            // eslint-disable-next-line max-len
            'https://raw.githubusercontent.com/chrisleekr/nodejs-image-optimisation/master/app/controllers/__tests__/sample1.json'
          );
        });

        it('retruns validation error', () => {
          expect(response.status).toBe(422);

          expect(response.text).toBe(
            JSON.stringify({
              success: false,
              status: 422,
              message: 'There is a validation error.',
              data: [
                {
                  value:
                    // eslint-disable-next-line max-len
                    'https://raw.githubusercontent.com/chrisleekr/nodejs-image-optimisation/master/app/controllers/__tests__/sample1.json',
                  msg: 'Provided image URL is not allowed.',
                  param: 'url',
                  location: 'body'
                }
              ]
            })
          );
        });
      });
    });

    describe('when success optimisation', () => {
      describe('with image file', () => {
        beforeEach(async () => {
          response = await request.post('/image').attach('image', `${path.resolve(`${__dirname}/sample1.jpg`)}`);
        });

        it('retruns 200', () => {
          expect(response.status).toBe(200);
        });

        it('retruns headers', () => {
          expect(response.headers['x-old-file-size']).toBe('661813');
          expect(response.headers['x-new-file-size']).toBe('233455');
          expect(response.headers['x-new-img-width']).toBe('750');
          expect(response.headers['x-new-img-height']).toBe('750');
        });
      });

      describe('with url', () => {
        beforeEach(async () => {
          response = await request
            .post('/image')
            .field(
              'url',
              'https://raw.githubusercontent.com/chrisleekr/nodejs-image-optimisation/master/examples/sample1.jpg'
            );
        });

        it('retruns 200', () => {
          expect(response.status).toBe(200);
        });

        it('retruns headers', () => {
          expect(response.headers['x-old-file-size']).toBe('661813');
          expect(response.headers['x-new-file-size']).toBe('233455');
          expect(response.headers['x-new-img-width']).toBe('750');
          expect(response.headers['x-new-img-height']).toBe('750');
        });
      });
    });

    describe('when failed optimisation', () => {
      beforeEach(async () => {
        request = supertest(app);

        response = await request.post('/image').attach('image', `${path.resolve(`${__dirname}/sample2.jpg`)}`);
      });

      it('retruns 500', () => {
        expect(response.status).toBe(500);
      });
    });
  });
});
