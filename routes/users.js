const router = require('express').Router();
const { getUsers, getUserId, createUser } = require('../controllers/users');
//GET
router.get('/', getUsers);
//GET
router.get('/:userId', getUserId);
//POST
router.post('/', createUser);

module.exports = router;
