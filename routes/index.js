var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

/* POST data*/
router.post('/', function (req, res, next) {
    console.log('req');
    console.log(req);
    console.log('req.body');
    console.log(req.body);
});


module.exports = router;
