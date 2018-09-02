var express = require('express');
var router = express.Router();

router.get('/all', function(req, res, next) {

    DB.StorageLocation.findAll({
        order: [ ['name', 'ASC'] ]
    }).then(storageLocations => {

        res.send({
            success: true,
            data: storageLocations
        })

    }).catch(function(error) { API_ERROR_HANDLER(error, req, res, next) })
})

module.exports = router;
