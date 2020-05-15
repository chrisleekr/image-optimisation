const util = require('../util');
const { logger } = require('../logger');

jest.mock('fs', () => ({
  unlinkSync: jest.fn()
}));

// eslint-disable-next-line import/order
const fs = require('fs');

describe('util', () => {
  let result;
  describe('getIPAddress', () => {
    describe('if headers has x-forwarded-for', () => {
      beforeEach(() => {
        result = util.getIPAddress({
          headers: {
            'x-forwarded-for': '123.123.123.123'
          }
        });
      });

      it('returns expected ip address', () => {
        expect(result).toBe('123.123.123.123');
      });
    });

    describe('if headers does not have x-forwarded-for', () => {
      beforeEach(() => {
        result = util.getIPAddress({
          headers: {},
          connection: {
            remoteAddress: '234.234.234.234'
          }
        });
      });

      it('returns expected ip address', () => {
        expect(result).toBe('234.234.234.234');
      });
    });
  });

  describe('deleteFiles', () => {
    beforeEach(() => {
      util.deleteFiles(logger, ['sample-tmp.jpg']);
    });

    it('triggers fs.unlinkSync', () => {
      expect(fs.unlinkSync).toHaveBeenCalledWith('sample-tmp.jpg');
    });
  });
});
