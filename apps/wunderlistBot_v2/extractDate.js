'use strict';

const moment = require('moment');

function extractDate($body, format) {
    // extract date of delivery
    var dateOfDelivery;
    var dateOfDeliveryRaw = $body('body').find('#deliveryDate').html();

    if (dateOfDeliveryRaw === undefined) return false;

    // use the comma in the substring and day to see if it is the custom full date convention
    // of 15th February 2018, Thursday
    function checkIsCustomFormat(dateString) {

        // if dateString is null or false, just return and let there be no dates.
        if(!dateString) return false;

        // if dateString doesn't have a comma, assume it is not the custom format
        if (dateString.indexOf(',') === -1) return false;

        // if comma is found, do some more check
        let days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

        var found = false;

        for(let i=0; i<days.length; i++) {
            if (dateString.indexOf(days[i]) !== -1) {
                found = true;
                break
            }
        }

        return found;
    }


    if (checkIsCustomFormat(dateOfDeliveryRaw)) {
        dateOfDelivery = moment(dateOfDeliveryRaw, "Do MMMM YYYY, dddd");
    } else {

        // if not just attempt to format it anyway
        dateOfDelivery = moment(dateOfDeliveryRaw);
    }

    if (dateOfDelivery.format() === 'Invalid date') {
        console.log('WARN: Invalid date format detected: ' + dateOfDeliveryRaw);
        return false;
    }

    return (format) ? dateOfDelivery.format(format) : dateOfDelivery;
}

module.exports = extractDate
