const express = require('express');
const router = express.Router();

const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register user
router.post(
  '/register',
  [
    check('name', 'Name is required').notEmpty(),
    check('phone', 'Phone is required').notEmpty(),
    check('password', 'Password min 6 chars').isLength({ min: 6 })
  ],
  authController.register
);

// @route   POST api/auth/login
// @desc    Login user
router.post(
  '/login',
  [
    check('phone', 'Phone is required').notEmpty(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// @route   GET api/auth/me
// @desc    Get current user
router.get('/me', auth, authController.me);

module.exports = router;
