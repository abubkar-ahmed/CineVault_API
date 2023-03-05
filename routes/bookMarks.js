const express = require('express');
const router = express.Router();
const bookMarks = require('../controllers/bookMarksController');
const verifyJWT = require('../middleware/verifyJWT')

router.route('/details')
    .get(verifyJWT , bookMarks.getBookMarksDetails)

router.route('/ids')
    .get(verifyJWT , bookMarks.getBookMarksIds)

router.route('/')
    .post(verifyJWT , bookMarks.addToBookMarks)

router.route('/:mediaId')
    .delete(verifyJWT , bookMarks.removeFromBookMarks)
    
module.exports = router