/** @format */

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multerConfig = require('../middleware/multer-config');
const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBooks);
router.post(
  '/',
  auth,
  multerConfig.upload,
  multerConfig.convertToWebp,
  bookCtrl.createBook
);

module.exports = router;
