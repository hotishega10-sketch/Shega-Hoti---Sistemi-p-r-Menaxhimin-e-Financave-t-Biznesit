const router = require('express').Router();
const users = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(verifyToken, checkRole([ROLES.OWNER]));
router.get('/', users.list);
router.post('/', users.create);

module.exports = router;
