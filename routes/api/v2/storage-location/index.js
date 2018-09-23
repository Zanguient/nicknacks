var express = require('express');
var router = express.Router();
const permit = require(__appsDir + '/passport/permit')('/api/v2/storage-location')

router.get('/all', permit('/all', 1), function(req, res, next) {

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
