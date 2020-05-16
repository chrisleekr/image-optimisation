/* eslint-disable global-require */
const path = require('path');

const { logger } = require('../logger');

let image;

describe('image', () => {
  let result;
  let error;
  let orgFilePath;
  let outputPath;

  const compressOptions = {};

  beforeEach(() => {
    jest.resetModules();
  });

  describe('saveUploadedImage', () => {
    beforeEach(async () => {
      image = require('../image');

      result = await image.saveUploadedImage({
        name: 'test.jpg',
        mv: jest.fn()
      });
    });

    it('returns expected value', () => {
      const uploadPath = `${path.resolve(`${__dirname}/../../../data/upload`)}/`;
      outputPath = `${path.resolve(`${__dirname}/../../../data/output`)}/`;

      expect(result).toStrictEqual({
        extension: '.jpg',
        uploadPath,
        uploadFilePath: expect.any(String),
        outputPath,
        outputFilePath: expect.any(String)
      });
    });
  });

  describe('compressImage', () => {
    describe('jpg', () => {
      beforeEach(async () => {
        image = require('../image');

        orgFilePath = `${path.resolve(`${__dirname}/sample1.jpg`)}`;
        outputPath = `${path.resolve(`${__dirname}/../../../data/output`)}/`;

        result = await image.compressImage(logger, orgFilePath, outputPath, compressOptions);
      });

      it('returns expected value', () => {
        expect(result).toStrictEqual({
          data: expect.any(Buffer),
          sourcePath: orgFilePath,
          destinationPath: `${outputPath}sample1.jpg`,
          sourceImageInfo: {
            sha1: '912f8040712d3f3a71fd3a555c839eef6bd20237',
            bytes: 661813,
            ext: 'jpg',
            mime: 'image/jpeg',
            width: 750,
            height: 750,
            type: 'jpg'
          },
          destinationImageInfo: {
            sha1: 'eb57bea59e36b530b22552c3825418c65ad983c4',
            bytes: 233455,
            ext: 'jpg',
            mime: 'image/jpeg',
            width: 750,
            height: 750,
            type: 'jpg'
          }
        });
      });
    });

    describe('png', () => {
      beforeEach(async () => {
        image = require('../image');

        orgFilePath = `${path.resolve(`${__dirname}/sample1.png`)}`;
        outputPath = `${path.resolve(`${__dirname}/../../../data/output`)}/`;

        result = await image.compressImage(logger, orgFilePath, outputPath, compressOptions);
      });

      it('returns expected value', () => {
        expect(result).toStrictEqual({
          data: expect.any(Buffer),
          sourcePath: orgFilePath,
          destinationPath: `${outputPath}sample1.png`,
          sourceImageInfo: {
            sha1: '378cd29a2ab0c52fce31e5125f706c6cff07ebd8',
            bytes: 3414396,
            ext: 'png',
            mime: 'image/png',
            width: 2048,
            height: 1141,
            type: 'png'
          },
          destinationImageInfo: {
            sha1: '2a51e55c9d09a0b104d6347a54227cbe92e343c4',
            bytes: 679237,
            ext: 'png',
            mime: 'image/png',
            width: 2048,
            height: 1141,
            type: 'png'
          }
        });
      });
    });

    describe('gif', () => {
      beforeEach(async () => {
        image = require('../image');

        orgFilePath = `${path.resolve(`${__dirname}/sample1.gif`)}`;
        outputPath = `${path.resolve(`${__dirname}/../../../data/output`)}/`;

        result = await image.compressImage(logger, orgFilePath, outputPath, compressOptions);
      });

      it('returns expected value', () => {
        expect(result).toStrictEqual({
          data: expect.any(Buffer),
          sourcePath: orgFilePath,
          destinationPath: `${outputPath}sample1.gif`,
          sourceImageInfo: {
            sha1: 'b2446bea9db819e129ad7a49cb41a91364f67aa6',
            bytes: 3130699,
            ext: 'gif',
            mime: 'image/gif',
            width: 540,
            height: 270,
            type: 'gif'
          },
          destinationImageInfo: {
            sha1: '1d504487d670a55f550c8da88bc3d7ff9b33d571',
            bytes: 3129563,
            ext: 'gif',
            mime: 'image/gif',
            width: 540,
            height: 270,
            type: 'gif'
          }
        });
      });
    });

    describe('svg', () => {
      beforeEach(async () => {
        image = require('../image');

        orgFilePath = `${path.resolve(`${__dirname}/sample1.svg`)}`;
        outputPath = `${path.resolve(`${__dirname}/../../../data/output`)}/`;

        result = await image.compressImage(logger, orgFilePath, outputPath, compressOptions);
      });

      it('returns expected value', () => {
        expect(result).toStrictEqual({
          data: expect.any(Buffer),
          sourcePath: orgFilePath,
          destinationPath: `${outputPath}sample1.svg`,
          sourceImageInfo: {
            sha1: 'c7580ccd3ba8329279074d1ce76352826908fc29',
            bytes: 3513,
            width: 2500,
            height: 2500,
            type: 'svg'
          },
          destinationImageInfo: {
            sha1: '905b0f45692fb5be114734b2e3f7138678bcb603',
            bytes: 3511,
            width: 2500,
            height: 2500,
            type: 'svg'
          }
        });
      });
    });

    describe('when file does not exist', () => {
      beforeEach(async () => {
        image = require('../image');

        orgFilePath = `${path.resolve(`${__dirname}/sample999.jpg`)}`;
        outputPath = `${path.resolve(`${__dirname}/../../../data/non-exist`)}/`;

        result = await image.compressImage(logger, orgFilePath, outputPath, compressOptions).catch(e => {
          error = e;
        });
      });

      it('throws an error', () => {
        expect(error).toStrictEqual(new Error('Failed to compress image'));
      });
    });

    describe('when image info failed to retrieve info', () => {
      describe('error on retrieving source image info', () => {
        beforeEach(async () => {
          orgFilePath = `${path.resolve(`${__dirname}/sample1.jpg`)}`;
          outputPath = `${path.resolve(`${__dirname}/../../../data/output`)}/`;

          jest.mock('image-info', () =>
            jest.fn((_filePath, callback) => {
              return callback({ err: 'some error' }, {});
            })
          );
          image = require('../image');

          result = await image.compressImage(logger, orgFilePath, outputPath, compressOptions).catch(e => {
            error = e;
          });
        });

        it('throws an error', () => {
          expect(error).toStrictEqual(new Error('Failed to retrieve source image information'));
        });
      });

      describe('error on retrieving destination image info', () => {
        beforeEach(async () => {
          orgFilePath = `${path.resolve(`${__dirname}/sample1.jpg`)}`;
          outputPath = `${path.resolve(`${__dirname}/../../../data/output`)}/`;

          jest.mock('image-info', () =>
            jest.fn((filePath, callback) => {
              if (filePath.includes('/app/helpers/__tests__/sample1.jpg')) {
                return callback(null, {
                  some: 'info'
                });
              }
              return callback({ err: 'some error' }, {});
            })
          );
          image = require('../image');

          result = await image.compressImage(logger, orgFilePath, outputPath, compressOptions).catch(e => {
            error = e;
          });
        });

        it('throws an error', () => {
          expect(error).toStrictEqual(new Error('Failed to retrieve destination image information'));
        });
      });
    });
  });
});
