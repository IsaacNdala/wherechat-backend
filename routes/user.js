const express = require('express')
const multer = require('multer')
const { body } = require('express-validator')

const userController = require('../controllers/user')
const isAuthMiddleware = require('../middleware/is-auth')

const router = express.Router()


var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null, 'wherechat_' + Date.now() + '.png');
    }
  })
  
  const filter = (req, file, cb) => {
      if (
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/png'
        ) 
        {
            cb(null, true);
        } else {
            cb(null, false);
        }
  }

const upload = multer({ storage: storage, fileFilter: filter});

router.get('/location', isAuthMiddleware, userController.getUsersLocation)

router.get('/get-user/:userId', isAuthMiddleware, userController.getUser)

router.post('/edit-profile',
  isAuthMiddleware,
  upload.single('image'),
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
  body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Enter a valid email'),
  userController.editProfile)

  router.post('/edit-password',
    isAuthMiddleware,
    body('password')
    .not().isEmpty()
    .trim()
    .withMessage(`Password can't be empty`),
    body('newPassword')
    .not().isEmpty()
    .trim()
    .withMessage(`New password can't be empty`),
    userController.editPassword)

  router.post('/delete-account',
    isAuthMiddleware,
    userController.deleteAccount)

  router.post('/search-users',
    isAuthMiddleware,
    body('search')
    .not().isEmpty()
    .trim()
    .withMessage(`search can't be empty`),
    userController.searchForUsers)

module.exports = router