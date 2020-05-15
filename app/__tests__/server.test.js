const supertest = require('supertest');
const packageJSON = require('../../package.json');
const { app, server } = require('../server');

describe('server', () => {
  let request;
  let response;

  beforeAll(async () => {
    request = supertest(app);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('/', () => {
    beforeEach(async () => {
      response = await request.get('/');
    });

    it('retruns expected response', () => {
      expect(response.status).toBe(200);

      expect(response.text).toBe(
        JSON.stringify({
          success: true,
          status: 200,
          message: 'OK',
          data: {
            serverStatus: 'online',
            version: packageJSON.version
          }
        })
      );
    });
  });

  describe('404', () => {
    beforeEach(async () => {
      response = await request.get('/404');
    });

    it('retruns expected response', () => {
      expect(response.status).toBe(404);

      expect(response.text).toBe(
        JSON.stringify({
          success: false,
          status: 404,
          message: 'Page not found.',
          data: {}
        })
      );
    });
  });
});
