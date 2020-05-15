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
      describe('when image is not provided', () => {
        beforeEach(async () => {
          response = await request.post('/image');
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
                  msg: "Cannot read property 'image' of undefined",
                  param: 'image',
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
              message: 'There is a validation error.',
              data: [
                {
                  msg: 'Image must be provided.',
                  param: 'image',
                  location: 'body'
                }
              ]
            })
          );
        });
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

    describe('when success optimisation', () => {
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
