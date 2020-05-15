/* eslint-disable global-require */
let bunyan;
const packageJSON = require('../../../package.json');

describe('logger', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('NODE_ENV is test', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';

      jest.mock('bunyan', () => ({
        FATAL: 10,
        TRACE: 1,
        createLogger: jest.fn(() => ({
          info: jest.fn()
        }))
      }));
      bunyan = require('bunyan');

      require('../logger');
    });

    it('triggers createLogger', () => {
      expect(bunyan.createLogger).toHaveBeenCalledWith({
        name: 'api',
        version: packageJSON.version,
        streams: [
          {
            stream: process.stdout,
            level: bunyan.FATAL
          }
        ]
      });
    });
  });

  describe('NODE_ENV is not test', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'prod';

      jest.mock('bunyan', () => ({
        FATAL: 10,
        TRACE: 1,
        createLogger: jest.fn(() => ({
          info: jest.fn()
        }))
      }));
      bunyan = require('bunyan');

      require('../logger');
    });

    it('triggers createLogger', () => {
      expect(bunyan.createLogger).toHaveBeenCalledWith({
        name: 'api',
        version: packageJSON.version,
        streams: [
          {
            stream: process.stdout,
            level: bunyan.TRACE
          }
        ]
      });
    });
  });
});
