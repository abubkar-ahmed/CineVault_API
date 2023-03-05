const express = require('express');
const router = express.Router();
const getDataController = require('../controllers/getDataController');
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .get(getDataController.getAllData)

router.route('/movies/:page')
    .get(getDataController.getMovies)

router.route('/tv/:page')
    .get(getDataController.getTv)

router.route('/recomended')
    .get(verifyJWT , getDataController.getRecomended)

module.exports = router