const router = require('express').Router();
const inv = require('../controllers/invoiceController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const { OWNER, ACCOUNTANT } = ROLES;

router.use(verifyToken, checkRole([OWNER, ACCOUNTANT]));
router.get('/', inv.list);
router.post('/', inv.create);
router.get('/:id', inv.getOne);
router.patch('/:id/pay', inv.markPaid);
router.delete('/:id', checkRole([OWNER]), inv.remove);

module.exports = router;
