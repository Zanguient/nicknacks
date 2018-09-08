'use strict'

const debug = require('debug')('nn:wunderlistBot:connectionTest')

function connectionTest(options) {

    let retries = 0

    WL.initialized.done(function () {
        _getAllLists(options, retries)
    }).fail(function () {
        console.error('CRITICAL: Wunderlist initialization failed.');
        throw new Error('CRITICAL: Wunderlist initialization failed.');
    });

    function _getAllLists(options, retries) {

        WL.http.lists.all().done(function (lists) {
            // all is good
            debug('Wunderlist connection good.');

            setTimeout(() => { _getAllLists(options) }, options.testInterval * 60 * 100)

            return;
        }).fail(function () {

            console.error('CRITICAL: Wunderlist connection failed on retry attempt number ' + retries + '.');

            // if retries hits the limit. It is better to not use equality because if somehow the
            // retry counts when above the limit, the system goes into unintended retry operations
            // and cannot self recover
            if (retries < options.retryLimit + 1) throw new Error('CRITICAL: Wunderlist connection failed.')

            retries += 1

            // retry.
            setTimeout(() => { WLConnectionTest(options, retries) }, options.testInterval * 60 * 100);

        })
    }
}

module.exports = connectionTest
