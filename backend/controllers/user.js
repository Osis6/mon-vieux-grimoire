/** @format */

const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const emailValidator = require('email-validator');
const passwordValidator = require('password-validator');
const crypto = require('crypto');
require('dotenv').config();

// Generate a complex JWT secret key
const generateJwtSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};
const jwtSecret = generateJwtSecret();

exports.signup = (req, res, next) => {
  if (!emailValidator.validate(req.body.email)) {
    return res.status(400).json({ error: 'Adresse e-mail invalide !' });
  }

  const schema = new passwordValidator();
  schema
    .is()
    .min(8)
    .is()
    .max(100)
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .digits(1)
    .has()
    .not()
    .spaces();

  if (!schema.validate(req.body.password)) {
    return res.status(400).json({
      error:
        "Le mot de passe doit comporter au moins 8 caractères, une lettre majuscule, une lettre minuscule, un chiffre et ne doit pas contenir d'espaces !",
    });
  }

  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          const token = jwt.sign({ userId: user._id }, jwtSecret, {
            expiresIn: '48h',
          });
          res.status(200).json({
            userId: user._id,
            token: token,
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
