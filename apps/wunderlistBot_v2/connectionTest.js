'use strict'

const debug = require('debug')('nn:wunderlistBot:connectionTest')
debug.log = console.log.bind(console)

function connectionTest(options) {

    let retries = 0

    // if somehow WL token is not valid, check and send email. Don't let nicknacks crash.
    if (!D.get(WL, 'initialized.done')) {
        let error = new Error('CRITIAL: Wunderlist initialization.done() not defined.')
        Object.assign(error, {
            level: 'high',
            sendEmail: true
        })
        throw error
    }

    WL.initialized.done(function () {
        _getAllLists(options, retries)
    }).fail(function () {
        console.error('CRITICAL: Wunderlist initialization failed.')
        let error = new Error('CRITICAL: Wunderlist initialization failed.')
        error.level = 'high'
        throw error
    });

    function _getAllLists(options, retries) {

        WL.http.lists.all().done(function (lists) {
            // all is good
            //debug('Wunderlist connection good.');

            setTimeout(() => { _getAllLists(options, retries) }, options.testInterval * 60 * 100)

            return;
        }).fail(function () {

            console.error('CRITICAL: Wunderlist connection failed on retry attempt number ' + retries + '.');

            // if retries hits the limit. It is better to not use equality because if somehow the
            // retry counts when above the limit, the system goes into unintended retry operations
            // and cannot self recover
            if (retries > options.retryLimit) throw new Error('CRITICAL: Wunderlist connection failed.')

            retries += 1

            // retry.
            setTimeout(() => { connectionTest(options, retries) }, options.retryInterval * 60 * 100);

        })
    }
}

module.exports = connectionTest
