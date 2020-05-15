/* eslint-disable global-require */
const fs = require('fs');
const path = require('path');
const { logger } = require('../logger');

let response;

describe('response', () => {
  let req;
  let res;
  let error;
  let result;
  let errorArray;

  beforeEach(() => {
    jest.resetModules();
  });

  describe('handleValidationError', () => {
    describe('when there is no validation error', () => {
      beforeEach(() => {
        jest.mock('express-validator', () => ({
          validationResult: jest.fn(() => ({
            isEmpty: jest.fn().mockReturnValue(true)
          }))
        }));

        response = require('../response');

        result = response.handleValidationError(req, res);
      });

      it('returns null', () => {
        expect(result).toBeNull();
      });
    });

    describe('with single validation error', () => {
      beforeEach(() => {
        jest.mock('express-validator', () => ({
          validationResult: jest.fn(() => ({
            isEmpty: jest.fn().mockReturnValue(false),
            array: jest.fn(() => [
              {
                some: 'error'
              }
            ])
          }))
        }));

        res = {
          status: jest.fn(() => ({
            json: jest.fn(json => json)
          }))
        };

        response = require('../response');

        result = response.handleValidationError(req, res);
      });

      it('returns expected error', () => {
        expect(result).toStrictEqual({
          data: [{ some: 'error' }],
          message: 'There is a validation error.',
          status: 422,
          success: false
        });
      });
    });

    describe('with multiple validation errors', () => {
      beforeEach(() => {
        jest.mock('express-validator', () => ({
          validationResult: jest.fn(() => ({
            isEmpty: jest.fn().mockReturnValue(false),
            array: jest.fn(() => [
              {
                some: 'error'
              },
              {
                another: 'error'
              }
            ])
          }))
        }));

        res = {
          status: jest.fn(() => ({
            json: jest.fn(json => json)
          }))
        };

        response = require('../response');

        result = response.handleValidationError(req, res);
      });

      it('returns expected error', () => {
        expect(result).toStrictEqual({
          data: [{ some: 'error' }, { another: 'error' }],
          message: 'There are validation errors.',
          status: 422,
          success: false
        });
      });
    });
  });

  describe('handleCustomValidationError', () => {
    beforeEach(() => {
      res = {
        status: jest.fn(() => ({
          json: jest.fn(json => json)
        }))
      };
      errorArray = [
        {
          some: 'error'
        },
        {
          another: 'error'
        }
      ];

      response = require('../response');

      result = response.handleCustomValidationError(res, errorArray);
    });

    it('returns expected error', () => {
      expect(result).toStrictEqual({
        data: [{ some: 'error' }, { another: 'error' }],
        message: 'There are validation errors.',
        status: 422,
        success: false
      });
    });
  });

  describe('handleError', () => {
    beforeEach(() => {
      res = {
        status: jest.fn(() => ({
          json: jest.fn(json => json)
        }))
      };

      response = require('../response');

      result = response.handleError(res, 'my message');
    });

    it('returns expected error', () => {
      expect(result).toStrictEqual({
        data: {},
        message: 'my message',
        status: 500,
        success: false
      });
    });
  });

  describe('handleSuccess', () => {
    beforeEach(() => {
      res = {
        status: jest.fn(() => ({
          json: jest.fn(json => json)
        }))
      };

      response = require('../response');

      result = response.handleSuccess(res, 'my message', { my: 'data' });
    });

    it('returns expected error', () => {
      expect(result).toStrictEqual({
        data: { my: 'data' },
        message: 'my message',
        status: 200,
        success: true
      });
    });
  });

  describe('handleNotFound', () => {
    beforeEach(() => {
      res = {
        status: jest.fn(() => ({
          json: jest.fn(json => json)
        }))
      };

      response = require('../response');

      result = response.handleNotFound(res, 'my message');
    });

    it('returns expected error', () => {
      expect(result).toStrictEqual({
        data: {},
        message: 'my message',
        status: 404,
        success: false
      });
    });
  });

  describe('handleSuccessFile', () => {
    let filePath;

    describe('when file does not exist', () => {
      beforeEach(() => {
        res = {
          status: jest.fn(() => ({
            json: jest.fn(json => json)
          }))
        };

        filePath = `${path.resolve(`${__dirname}/sample999.jpg`)}`;

        response = require('../response');

        result = response.handleSuccessFile(res, filePath, {
          headers: {},
          logger,
          deleteFileAfterReturn: true
        });
      });

      it('returns expected result', () => {
        expect(result).toStrictEqual({
          data: {},
          message: 'File does not exist.',
          status: 404,
          success: false
        });
      });
    });

    describe('when sendFile returns an error', () => {
      beforeEach(() => {
        res = {
          status: jest.fn(() => ({
            json: jest.fn(json => json),
            sendFile: jest.fn((_filePath, _options, callback) => {
              callback('my error');
            })
          }))
        };

        const orgFilePath = `${path.resolve(`${__dirname}/sample1.jpg`)}`;
        filePath = `${path.resolve(`${__dirname}/sample-tmp.jpg`)}`;
        fs.copyFileSync(orgFilePath, filePath);

        response = require('../response');

        try {
          result = response.handleSuccessFile(res, filePath, {
            headers: {},
            logger,
            deleteFileAfterReturn: true
          });
        } catch (e) {
          error = e;
        }
      });

      it('returns expected result', () => {
        expect(error).toStrictEqual(new Error('my error'));
      });
    });

    describe('deleteFileAfterReturn', () => {
      let util;
      describe('when deleteFileAfterReturn sets as true', () => {
        beforeEach(() => {
          res = {
            status: jest.fn(() => ({
              json: jest.fn(json => json),
              sendFile: jest.fn((_filePath, _options, callback) => {
                callback(null);
              })
            }))
          };

          const orgFilePath = `${path.resolve(`${__dirname}/sample1.jpg`)}`;
          filePath = `${path.resolve(`${__dirname}/sample-tmp.jpg`)}`;
          fs.copyFileSync(orgFilePath, filePath);

          jest.mock('../util', () => ({
            deleteFiles: jest.fn()
          }));
          util = require('../util');
          response = require('../response');

          try {
            result = response.handleSuccessFile(res, filePath, {
              headers: {
                some: 'header'
              },
              logger,
              deleteFileAfterReturn: true
            });
          } catch (e) {
            error = e;
          }
        });

        it('triggers deleteFiles', () => {
          expect(util.deleteFiles).toHaveBeenCalledWith(logger, [filePath]);
        });
      });

      describe('when deleteFileAfterReturn sets as false', () => {
        beforeEach(() => {
          res = {
            status: jest.fn(() => ({
              json: jest.fn(json => json),
              sendFile: jest.fn((_filePath, _options, callback) => {
                callback(null);
              })
            }))
          };

          const orgFilePath = `${path.resolve(`${__dirname}/sample1.jpg`)}`;
          filePath = `${path.resolve(`${__dirname}/sample-tmp.jpg`)}`;
          fs.copyFileSync(orgFilePath, filePath);

          jest.mock('../util', () => ({
            deleteFiles: jest.fn()
          }));
          util = require('../util');
          response = require('../response');

          try {
            result = response.handleSuccessFile(res, filePath, {
              headers: {
                some: 'header'
              },
              logger,
              deleteFileAfterReturn: false
            });
          } catch (e) {
            error = e;
          }
        });

        it('does not trigger deleteFiles', () => {
          expect(util.deleteFiles).not.toHaveBeenCalled();
        });
      });

      describe('without third parameters', () => {
        beforeEach(() => {
          res = {
            status: jest.fn(() => ({
              json: jest.fn(json => json),
              sendFile: jest.fn((_filePath, _options, callback) => {
                callback(null);
              })
            }))
          };

          const orgFilePath = `${path.resolve(`${__dirname}/sample1.jpg`)}`;
          filePath = `${path.resolve(`${__dirname}/sample-tmp.jpg`)}`;
          fs.copyFileSync(orgFilePath, filePath);

          jest.mock('../util', () => ({
            deleteFiles: jest.fn()
          }));
          util = require('../util');
          response = require('../response');

          try {
            result = response.handleSuccessFile(res, filePath, {});
          } catch (e) {
            error = e;
          }
        });

        it('does not trigger deleteFiles', () => {
          expect(util.deleteFiles).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('handleForbidden', () => {
    beforeEach(() => {
      res = {
        status: jest.fn(() => ({
          json: jest.fn(json => json)
        }))
      };

      response = require('../response');

      result = response.handleForbidden(res, 'my message');
    });

    it('returns expected error', () => {
      expect(result).toStrictEqual({
        data: {},
        message: 'my message',
        status: 403,
        success: false
      });
    });
  });

  describe('handleRedirect', () => {
    beforeEach(() => {
      res = {
        redirect: jest.fn()
      };

      response = require('../response');

      result = response.handleRedirect(res, 302, 'https://google.com');
    });

    it('returns expected error', () => {
      expect(res.redirect).toHaveBeenCalledWith(302, 'https://google.com');
    });
  });

  describe('validateRequest', () => {
    describe('when handleValidationError returns not null', () => {
      beforeEach(async () => {
        jest.mock('express-validator', () => ({
          validationResult: jest.fn(() => ({
            isEmpty: jest.fn().mockReturnValue(false),
            array: jest.fn(() => [
              {
                some: 'error'
              }
            ])
          }))
        }));

        res = {
          status: jest.fn(() => ({
            json: jest.fn(json => json)
          }))
        };

        response = require('../response');
        result = await response.validateRequest(req, res, {});
      });

      it('returns expected error', () => {
        expect(result).toStrictEqual({
          data: [{ some: 'error' }],
          message: 'There is a validation error.',
          status: 422,
          success: false
        });
      });
    });

    describe('when handleValidationError returns  null', () => {
      beforeEach(async () => {
        jest.mock('express-validator', () => ({
          validationResult: jest.fn(() => ({
            isEmpty: jest.fn().mockReturnValue(true),
            array: jest.fn(() => [])
          }))
        }));

        res = {
          status: jest.fn(() => ({
            json: jest.fn(json => json)
          }))
        };

        response = require('../response');
        result = await response.validateRequest(req, res, {});
      });

      it('returns null', () => {
        expect(result).toBeNull();
      });
    });
  });
});
