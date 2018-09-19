'use strict'
const D = require('dottie');
const cheerio = require('cheerio');
const moment = require('moment');
const S = require('string');
const debug = require('debug')('nn:apps:wunderlistBot')
debug.log = console.log.bind(console)

const M = require('./errorObjectMerger');
const makeIDObject = require('./makeIDObject.js');
const extractDate = require('./extractDate.js');
const createWunderlistTask = require('./createWunderlistTask.js')
const updateWunderlistTask = require('./updateWunderlistTask.js')
const prepareComments = require('./prepareComments.js');

function wunderlistBot(fromMagento, options) {

    debug(fromMagento)

    var type = fromMagento.type

    if(!type || typeof type !== 'string') {
        let error = new Error('Type of `type` is not a string.')
        error.status = 400
        throw error
    }
    type = type.toLowerCase()

    if (type === 'order') {
        // 1.  SALES ORDER
        return createWunderlistTask(fromMagento, options)

    } else {
        return updateWunderlistTask(fromMagento, options)

    }

}

module.exports = wunderlistBot;
