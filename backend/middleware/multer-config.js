/** @format */

const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + '_' + Date.now() + '.' + extension);
  },
});

const upload = multer({ storage: storage }).single('image');
const convertToWebp = (req, res, next) => {
  if (req.file) {
    const { path } = req.file;
    const webpPath = path.replace(/\.[^.]+$/, '.webp');

    sharp(path)
      .webp()
      .toFile(webpPath)
      .then(async () => {
        sharp(webpPath)
          .webp({ quality: 80 })
          .toFile(webpPath, () => {
            req.file.path = webpPath;
            next();
          });
      })
      .catch((error) => {
        next(error);
      });
  } else {
    next();
  }
};

module.exports = { upload, convertToWebp };
