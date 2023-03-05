const express = require('express');
const router = express.Router();
const registerCntroller = require('../controllers/registerControlles');

router.route('/')
    .post(registerCntroller.handleNewUser)

module.exports = router;