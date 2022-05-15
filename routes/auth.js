const express = require('express')
const { body } = require('express-validator')

const authController = require('../controllers/auth')

const router = express.Router()

router.post(
  '/sign-up',
  body('firstName')
    .not().isEmpty()
    .trim()
    .withMessage(`First name can't be empty`),
  body('lastName')
    .not().isEmpty()
    .trim()
    .withMessage(`Last name can't be empty`),
  body('email')
    .not().isEmpty()
    .withMessage(`Email can't be empty`),
  body('password')
    .not().isEmpty()
    .withMessage(`Password can't be empty`),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Enter a valid email'),
  authController.signUp
)

router.post('/sign-in',
  body('email')
    .not().isEmpty()
    .withMessage(`Email can't be empty`),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Enter a valid email'),
  body('password')
    .not().isEmpty()
    .withMessage(`Password can't be empty`),
  authController.signIn
)

module.exports = router