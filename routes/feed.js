var express = require('express');
var router = express.Router();

/* GET feed page. */
router.get('/', function(req, res, next) {
    res.render('feed');
});

module.exports = router;