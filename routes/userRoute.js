const express = require('express');
const router = express.Router();

const {createNewUser, updateUser, getUsers, getUserBySlug , deleteUser} = require('../controllers/userController');

// POST /api/user/create
router.route('/create').post(createNewUser)

// POST /api/user/update
router.route('/update/:email').put(updateUser)

// POST /api/users
router.route('/users').get(getUsers)

// POST /users/:email/:slug
router.route('/users/:email/:slug').get(getUserBySlug);

// POST /users/delete/:email
router.route('/delete/:email/').delete(deleteUser);

module.exports = router;