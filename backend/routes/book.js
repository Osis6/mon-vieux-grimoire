/** @format */

const express = require('express');
const router = express.Router();

// Importation des middlewares et des contrôleurs
const auth = require('../middleware/auth');
const multerConfig = require('../middleware/multer-config');
const bookCtrl = require('../controllers/book');

// Routes pour les différentes fonctionnalités du livre
router.get('/', bookCtrl.getAllBooks);
router.post(
  '/',
  auth,
  multerConfig.upload,
  multerConfig.convertToWebp,
  bookCtrl.createBook
);
router.get('/:id', bookCtrl.getBook);
router.put(
  '/:id',
  auth,
  multerConfig.upload,
  multerConfig.convertToWebp,
  bookCtrl.modifyBook
);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.post('/:id/rating', auth, bookCtrl.rateBook);

module.exports = router;
