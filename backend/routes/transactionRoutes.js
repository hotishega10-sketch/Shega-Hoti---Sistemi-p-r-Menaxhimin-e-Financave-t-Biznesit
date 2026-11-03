const router = require('express').Router();
const tx = require('../controllers/transactionController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const { OWNER, ACCOUNTANT, EMPLOYEE } = ROLES;

router.use(verifyToken);
router.get('/summary', tx.summary); // para '/:id', që 'summary' të mos lexohet si ID
router.get('/', tx.list);
router.post('/', checkRole([OWNER, ACCOUNTANT, EMPLOYEE]), tx.create);
router.get('/:id', tx.getOne);
router.patch('/:id', checkRole([OWNER, ACCOUNTANT]), tx.update);
router.delete('/:id', checkRole([OWNER]), tx.remove);

module.exports = router;
