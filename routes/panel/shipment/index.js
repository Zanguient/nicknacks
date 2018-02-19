var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

      res.render('shipment.hbs', {
          data: {}
      });

});

router.get('/history', function(req, res, next) {

      res.render('shipment.hbs', {
          data: { seeHistory: true }
      });

});

router.get('/create', function(req, res, next) {

      res.render('shipment-create.hbs', {
          data: {}
      });

});

router.get('/edit/:shipmentID', function(req, res, next) {

      res.render('shipment-edit.hbs', {
          shipmentID: req.params.shipmentID
      });

});

router.get('/shipout/:shipmentID', function(req, res, next) {

      res.render('shipment-shipout.hbs', {
          shipmentID: req.params.shipmentID
      });

});

router.get('/receive/:shipmentID', function(req, res, next) {

      res.render('shipment-receive.hbs', {
          shipmentID: req.params.shipmentID
      });

});

module.exports = router;
