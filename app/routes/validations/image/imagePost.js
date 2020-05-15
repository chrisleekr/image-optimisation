module.exports = {
  image: {
    custom: {
      options: async (value, { req }) => {
        if (req.files.image === undefined) {
          throw new Error('Image must be provided.');
        }

        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif', 'image/webp'];
        if (allowedMimeTypes.includes(req.files.image.mimetype) === false) {
          throw new Error(`Uploaded image is not allowed.`);
        }

        return true;
      }
    }
  }
};
