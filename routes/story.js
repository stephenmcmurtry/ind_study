var express = require('express');
var router = express.Router();

router.get('/:id', function(req, res){
    res.render('story', {id: req.params.id});
});

module.exports = router;