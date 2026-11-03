const router = require('express').Router();
const auth = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', verifyToken, auth.me);

module.exports = router;
