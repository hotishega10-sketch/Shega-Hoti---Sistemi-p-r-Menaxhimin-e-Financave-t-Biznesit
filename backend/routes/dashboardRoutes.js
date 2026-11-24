const router = require('express').Router();
const d = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, d.get);

module.exports = router;
