/** @format */

const Book = require('../models/book');
const fs = require('fs');

exports.createBook = async (req, res, next) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const webpFileName = req.file.filename.replace(/\.[^.]+$/, '.webp');
    const imageUrl = `${req.protocol}://${req.get(
      'host'
    )}/images/${webpFileName}`;

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl,
      averageRating: 0,
      rating: [],
    });

    await book.save();

    const link = `${req.protocol}://${req.get('host')}/images/${webpFileName}`;
    res.status(201).json({ message: 'Livre enregistré !', link });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.modifyBook = async (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;

  try {
    const book = await Book.findOne({ _id: req.params.id });

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ error: 'Requête non autorisée !' });
    }

    if (req.file && book.imageUrl) {
      const oldImagePath = `images/${book.imageUrl.split('/images/')[1]}`;
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    await Book.updateOne(
      { _id: req.params.id },
      { ...bookObject, _id: req.params.id }
    );
    res.status(200).json({ message: 'Livre modifié !' });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ error: 'Requête non autorisée !' });
    }

    const filename = book.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, (err) => {
      if (err) {
        console.error(err);
      }
    });

    await Book.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Livre supprimé !' });
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.rateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating } = req.body;

    console.log('ID du livre :', id);
    console.log('Données de notation reçues :', { userId, rating });

    const book = await Book.findById(id);

    if (book.ratings.some((r) => r.userId === userId)) {
      console.log("L'utilisateur a déjà noté ce livre.");
      return res
        .status(400)
        .json({ message: "L'utilisateur a déjà noté ce livre." });
    }

    if (typeof userId !== 'string' || typeof rating !== 'number') {
      console.log('Les données de notation sont invalides.');
      return res
        .status(400)
        .json({ message: 'Les données de notation sont invalides.' });
    }

    book.ratings.push({ userId, grade: rating });

    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce((total, r) => total + r.grade, 0);
    const minRating = 1;
    const maxRating = 5;
    const averageRating =
      totalRatings > 0
        ? Math.min(
            Math.max(Math.round(sumRatings / totalRatings), minRating),
            maxRating
          )
        : 0;

    book.averageRating = averageRating;

    await book.save();

    const updatedBook = await Book.findById(id);

    console.log('Informations du livre mises à jour :', updatedBook);

    res.status(200).json({
      message: 'La notation a été ajoutée avec succès.',
      book: updatedBook,
    });
  } catch (error) {
    console.error('Erreur lors de la notation du livre :', error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de la notation du livre.',
    });
  }
};

exports.getBook = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (id === 'bestrating') {
      const bestRatedBooks = await Book.find()
        .sort({ averageRating: -1 })
        .limit(3);
      res.json(bestRatedBooks);
    } else {
      const oneBook = await Book.findOne({ _id: id });
      if (oneBook) {
        res.status(200).json(oneBook);
      } else {
        res.status(404).json({ message: 'Livre non trouvé.' });
      }
    }
  } catch (error) {
    console.error('Error in getBook:', error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de la récupération des livres.',
      error: error.message,
    });
  }
};
