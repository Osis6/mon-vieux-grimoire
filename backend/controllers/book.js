/** @format */

const Book = require('../models/book');

// Fonction pour créer un livre
exports.createBook = async (req, res, next) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const webpFileName = req.file.filename.replace(/\.[^.]+$/, '.webp');
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${webpFileName}`,
      averageRating: 0,
      ratings: [],
    });

    await book.save();

    const link = `${req.protocol}://${req.get('host')}/images/${webpFileName}`;
    res.status(201).json({ message: 'Livre enregistré !', link });
  } catch (error) {
    console.error('Error in createBook:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Fonction pour récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error,
      });
    });
};
