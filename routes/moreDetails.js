const express = require('express');
const router = express.Router();
const moredetailsController = require('../controllers/moredetailsController')

router.route('/:type/:id')
    .get(moredetailsController.getDetails)


module.exports = router