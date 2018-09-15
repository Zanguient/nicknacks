const express = require('express')
const router = express.Router()
const debug = require('debug')('nn:api:inventory:movement-records')
const _ = require('lodash')

router.get('/all', (req, res, next) => {

    DB.InventoryMovement.findAll({ order: [ ['InventoryMovementID', 'DESC'] ]}).then(records => {
        res.send({
            success: true,
            data: records
        })
    }).catch(error => { API_ERROR_HANDLER(error, req, res, next) })

})

module.exports = router;
