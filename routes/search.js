const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/:query/:pageCount' , searchController.getSearch);

module.exports = router ;