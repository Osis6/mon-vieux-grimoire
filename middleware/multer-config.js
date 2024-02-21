/** @format */

const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

sharp.cache(false);

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
    const { path, filename } = req.file;
    const webpPath = path.replace(/\.[^.]+$/, '.webp');

    sharp(path)
      .webp({ quality: 80 })
      .toFile(webpPath, (err) => {
        if (err) {
          return next(err);
        }

        req.file.path = webpPath;
        req.file.filename = filename.replace(/\.[^.]+$/, '.webp');

        try {
          fs.unlinkSync(path);
        } catch (unlinkError) {
          console.error('Error during unlink:', unlinkError.message);
        }

        next();
      });
  } else {
    next();
  }
};

module.exports = { upload, convertToWebp };
