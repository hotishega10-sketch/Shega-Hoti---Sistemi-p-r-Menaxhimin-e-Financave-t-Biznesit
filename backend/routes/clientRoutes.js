const router = require('express').Router();
const c = require('../controllers/clientController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const { OWNER, ACCOUNTANT } = ROLES;

router.use(verifyToken, checkRole([OWNER, ACCOUNTANT]));
router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.getOne);
router.patch('/:id', c.update);
router.delete('/:id', checkRole([OWNER]), c.remove);

module.exports = router;
