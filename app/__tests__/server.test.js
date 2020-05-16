const supertest = require('supertest');
const packageJSON = require('../../package.json');

describe('server', () => {
  let request;
  let response;
  let serverApp;

  describe('/', () => {
    beforeEach(async () => {
      // eslint-disable-next-line global-require
      serverApp = require('../server');
      request = supertest(serverApp.app);

      response = await request.get('/');
    });

    afterEach(async () => {
      await serverApp.server.close();
      jest.resetModules();
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
      // eslint-disable-next-line global-require
      serverApp = require('../server');
      request = supertest(serverApp.app);

      response = await request.get('/404');
    });

    afterEach(async () => {
      await serverApp.server.close();
      jest.resetModules();
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

  describe('without process.env.RATE_LIMIT_MAX', () => {
    beforeEach(async () => {
      jest.mock('dotenv', () => ({
        config: jest.fn(() => {
          const orgProcessEnv = process.env;
          process.env = { ...orgProcessEnv };
          delete process.env.RATE_LIMIT_MAX;
        })
      }));

      // eslint-disable-next-line global-require
      serverApp = require('../server');
      request = supertest(serverApp.app);

      response = await request.get('/');
    });

    afterEach(async () => {
      await serverApp.server.close();
      jest.resetModules();
    });

    it('retruns expected response', () => {
      expect(response.status).toBe(200);
    });
  });
});
