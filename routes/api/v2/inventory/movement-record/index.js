const express = require('express')
const router = express.Router()
const permit = require(__appsDir + '/passport/permit')('/api/v2/inventory/movement-record')
const debug = require('debug')('nn:api:inventory:movement-records')
debug.log = console.log.bind(console)
const _ = require('lodash')

router.get('/all', permit('/all', 1), (req, res, next) => {

    DB.InventoryMovement.findAll({ order: [ ['InventoryMovementID', 'DESC'] ]}).then(records => {
        res.send({
            success: true,
            data: records
        })
    }).catch(error => { API_ERROR_HANDLER(error, req, res, next) })

})

module.exports = router;
