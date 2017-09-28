'use strict'
const D = require('dottie');
const cheerio = require('cheerio');
const moment = require('moment');

const M = require('./errorObjectMerger');
const makeIDObject = require('./makeIDObject.js');
const extractDate = require('./extractDate.js');
const createOrUpdateWunderlistTask = require('./createOrUpdateWunderlistTask.js');
const prepareComments = require('./prepareComments.js');

function wunderlistBot(mail) {

    var o = { success: false, stack: ['wunderlistBot'] };

    var operation = _sorter(mail);

    if (!operation.success) console.log('CRITICAL: Some operation failed: ' + JSON.stringify(operation));

    function _sorter(mail) {

        var o = { success: false, stack: ['_sorter'] }

        var rejection = _rejector(mail);
        if(rejection.success === false) return M(o, rejection);

        // get subject
        var subject = D.get(mail, 'subject');
        if (!subject) {
            o.error = 'subject is empty'; 
            return o;
        }

        // get ID
        var ID = makeIDObject(subject);

        // get body
        var bodyString = D.get(mail, 'html');
        if (!bodyString) {
            o.error = 'html is empty';
            return o;
        }
        var $body = cheerio.load(bodyString);
        if (!$body) {
            o.error = 'cheerio could not read email html'
            return o;
        }

        // get name
        var name = $body('body').find('#customerName').html();
        name = name ? name.replace(',', '') : 'nil';

        // NOW THE SORTING STARTS

            /*
                1. Sales order
                2. Update to sales order
                3. Delivery order
                4. Update to delivery order

            */


        if (subject.indexOf('Your Grey and Sanders order confirmation') === 0) {
            
            // 1.  SALES ORDER  
            createOrUpdateWunderlistTask(ID, name, $body, true);

        } else if (subject.indexOf('Update to your Grey and Sanders order') === 0) {

            // 2. UPDATE TO SALES ORDER
            var comments = prepareComments("UPDATE TO SALES ORDER", $body);
            createOrUpdateWunderlistTask(ID, name, $body, true, comments);

        } else if (subject.indexOf('Your Grey and Sanders order (') === 0 && subject.indexOf('is scheduled for delivery') !== -1) {

            // 3. DELIVERY ORDER
            var comments = prepareComments("DELIVERY ARRANGED", $body); 
            createOrUpdateWunderlistTask(ID, name, $body, false, comments);

        } else if (subject.indexOf('Update to your Grey and Sanders delivery') === 0) {

            // 4. UPDATES TO DELIVERY ORDER
            var comments = prepareComments("DELIVERY UPDATES", $body); 
            createOrUpdateWunderlistTask(ID, name, $body, false, comments);

        }

        o.success = true;
        return o;

        function _rejector(mail) {

            var o = { success: false, stack: ['_rejector'] }

            // reject criterii
            if(D.get(mail, 'from.0.address') !== 'sayhi@greyandsanders.com') {
                o.error = 'email address not from designated: ' + D.get(mail, 'from[0].address');
                return o;
            }

            // authentication
            var authenticationResults = D.get(mail, 'headers.authentication-results');

            if (!authenticationResults) {
                o.error = 'missing authentication headers.'; 
                return o;
            }

            var authenticationResults = authenticationResults.split(';').map(function(item) {
                return item.trim();
            })

            if (!authenticationResults.includes('dkim=pass')) {
                o.error = 'failed dkim check'; 
                return o;
            }

            o.success = true;
            return o;
        }

    }
        
};

module.exports = wunderlistBot;