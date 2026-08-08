const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, checkPermission } = require('../middlewares/auth');
const { PERMISSIONS } = require('../config/constants');

router.use(authenticate);
router.use(checkPermission(PERMISSIONS.USER_MANAGE));

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);

module.exports = router;
