'use strict'
const D = require('dottie');
const M = require('./errorObjectMerger');
const cheerio = require('cheerio');
const S = require('string');
const getShortID = require('./getShortID.js');
const moment = require('moment');
const WunderlistSDK = require('wunderlist');
const wunderlistAPI = new WunderlistSDK({
  'accessToken': process.env.WL_ACCESS_TOKEN,
  'clientID': process.env.WL_CLIENT_ID
});
const htmlToText = require('html-to-text');

function wunderlistBot(mail) {

    var o = { success: false, stack: ['wunderlistBot'] };

    _sorter(mail);

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
        var ID = subject.substring(subject.indexOf('#'), subject.indexOf('#') + 11);
        var shortID = getShortID(ID);

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
        var name = $body('body').find('#customerName').html().replace(',', '');;

        // NOW THE SORTING STARTS

        // original email sent out by the server
        if (subject.indexOf('Your Grey and Sanders order confirmation') === 0) {
            
            // extract date of delivery
            var dateOfDelivery;
            var dateOfDeliveryRaw = $body('body').find('#deliveryDate').html();
            //console.log(dateOfDeliveryRaw)
            if (dateOfDeliveryRaw === undefined) dateOfDelivery = false

            dateOfDelivery = moment(dateOfDeliveryRaw, "Do MMMM YYYY, dddd");

            if (dateOfDelivery.format() === 'Invalid date') {
                console.log('WARN: Invalid date format detected: ' + dateOfDeliveryRaw);
            }

            dateOfDelivery = dateOfDelivery.format('YYYY-MM-DD');

            var taskObject = {
                'list_id': parseInt(process.env.WL_LIST_ID_FOR_SALES_DELIVERY),
                'title': shortID + ', ' + name,
                'starred': true
            };

            if (dateOfDelivery) taskObject.due_date = dateOfDelivery;

            wunderlistAPI.http.tasks.create(taskObject).done(function(taskData, statusCode) {
                if(statusCode !== 201) {
                    return console.log('CRITICAL: ' + shortID + ' errored with statusCode = ' + statusCode);
                }

                var noteObject = {
                    "task_id": taskData.id,
                    "content": htmlToText.fromString(bodyString, {
                        wordwrap: 130,
                        ignoreImage: true,
                        ignoreHref: true
                    })
                };

                return wunderlistAPI.http.notes.create(noteObject).done(function(noteData, statusCode) {
                    if (statusCode !== 201) {
                        return console.log('CRITICAL: ' + shortID + ' note creation errored with statusCode = ' + statusCode);
                    }
                }).fail(function(resp, code) {
                    console.log('CRITICAL: ' + shortID + 'adding note errored! Error response is: ' + JSON.stringify(resp));
                });

            }).fail(function(resp, code) {
                console.log('CRITICAL: ' + shortID + ' creation errored! Error response is: ' + JSON.stringify(resp));
            });
        }


        
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