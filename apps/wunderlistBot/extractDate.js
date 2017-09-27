'use strict';

const moment = require('moment');

function extractDate($body, format) {
    // extract date of delivery
    var dateOfDelivery;
    var dateOfDeliveryRaw = $body('body').find('#deliveryDate').html();

    if (dateOfDeliveryRaw === undefined) return false;

    dateOfDelivery = moment(dateOfDeliveryRaw, "Do MMMM YYYY, dddd");

    if (dateOfDelivery.format() === 'Invalid date') {
        console.log('WARN: Invalid date format detected: ' + dateOfDeliveryRaw);
        return false;
    }

    return (format) ? dateOfDelivery.format(format) : dateOfDelivery;
}

module.exports = extractDate