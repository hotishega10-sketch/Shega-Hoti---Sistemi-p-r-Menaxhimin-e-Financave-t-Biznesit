const router = require('express').Router();
const cats = require('../controllers/categoryController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(verifyToken);
router.get('/', cats.list);
router.post('/', checkRole([ROLES.OWNER, ROLES.ACCOUNTANT]), cats.create);

module.exports = router;
