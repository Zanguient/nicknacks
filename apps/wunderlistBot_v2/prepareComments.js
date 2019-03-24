'use strict';

const makeIDObject = require('./makeIDObject')
const jsonFormat = require('json-format')

function prepareComments(fromMagento) {

    let obj = {}

    obj.salesOrderID = makeIDObject(fromMagento.order_id)
    obj.docID = makeIDObject(fromMagento.increment_id)

    let type = fromMagento.type.toLowerCase()

    if (['ordercomment', 'shipment', 'shipmentcomment'].indexOf(type) !== -1) {

        // keeping address as this can be changed
        obj.address = fromMagento.data.shipping_address


        if (fromMagento.data.delivery_date) {
            obj.deliveryDate = MOMENT.unix(fromMagento.data.delivery_date).format('YYYY-MM-DD')
            obj.deliveryDateFull = MOMENT.unix(fromMagento.data.delivery_date).format('Do MMMM YYYY dddd')
        }
        obj.deliveryTime = fromMagento.data.delivery_time
        obj.deliveryComments = fromMagento.data.delivery_comments

        // comment
        obj.comment = fromMagento.order_comment

        /* BODY */
        let body = '# ' + obj.salesOrderID.stub
        if (type === 'ordercomment') { body += ' Order Comment' }

        else if (type === 'shipment') {
            body += ' Delivery Order (No.'
            body += ' ' + obj.docID.withoutHex + ')'
        }

        else if (type === 'shipmentcomment') {
            body += ' Delivery Comment (for DO No.'
            body += ' ' + obj.docID.withoutHex + ')'
        }

        // if there are comments
        if (obj.comment && obj.comment.length > 0) body += '\n\n\n# Comments\n\n' + obj.comment

        // there can be non-deliverable products. So if have address will put
        if (obj.address && obj.address.length > 0) {
            body += '\n\n\n# Delivery'
            body += '\nAddress: ' + obj.address
            body += '\nDelivery date: ' + (obj.deliveryDateFull || 'Not indicated')
            body += '\nTime: ' + (obj.deliveryTime || 'Not indicated')
            if (obj.delivery_comments && obj.delivery_comments.length > 0) body += '\nComment: ' + obj.delivery_comments
        }

        if (['shipment', 'shipmentcomment'].indexOf(type) !== -1) {
            if (D.get(fromMagento, 'trackinginfo')) {
                body += '\n\n\n# Tracking'
                for(let i=0; i<fromMagento.trackinginfo.length; i++) {
                    let tracking = fromMagento.trackinginfo[i]
                    body += '\n' + (i+1) + '. ' + tracking.title + ' (' + tracking.number + ')'
                }
            }
        }

        return body

    } else if (type === "creditmemo") {

        let body = '# ' + obj.salesOrderID.stub

        body += ' Credit Memo (No.'
        body += ' ' + obj.docID.withoutHex + ')'

        body += '\n\n\n # Comment'
        body += '\n ' + fromMagento.customer_note

        body += '\n\n\n # Refund'
        body += '\n ' + fromMagento.all_data.grand_total

        return body

    } else {
        // need to format the rest later
        return jsonFormat(fromMagento)
    }

    return 'Error in preparing comments as `type` of ' + fromMagento.type + ' does not fall into any valid category.\nPlease check prepareComments.js. `fromMagento` output: ' + JSON.stringify(fromMagento)
}

module.exports = prepareComments;
