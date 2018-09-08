'use strict';

const debug = require('debug')('nn:apps:wunderlistBot:createWunderlistTask')
const makeIDObject = require('./makeIDObject.js')
const _ = require('lodash')
const createTask = require('./promises/createTask')
const createTaskNote = require('./promises/createTaskNote')
const createSubtask = require('./promises/createSubtask')
const getTaskByID = require('./promises/getTaskByID')

function createWunderlistTask(fromMagento, options) {

    var TASK_DATA

    let obj = {}
    obj.ID = makeIDObject(fromMagento.increment_id)

    debug('Initiating process for: ' + obj.ID.withoutHex)

    return DB.WunderlistTask.find({
        where: { salesOrderID: obj.ID.default }
    }).then(function(task) {

        if (task) {
            // already created in DB, check in Wunderlist
            return getTaskByID(parseInt(task.WunderlistTaskID)).then(wunderlistTask => {

                // if wunderlist task exist also, return false
                if (!(D.get(wunderlistTask, 'code') === 404)) {
                    debug('Task exist in wunderlist')
                    return false
                }

                // if tas
                debug(wunderlistTask)
                debug('Task does not exist in wunderlist')
                return task
            })

        } else {

            return 'toCreateBrandNewEntries'
        }
    }).then(dbTask => {

        if (dbTask === false) {
            debug('Wunderlist task already exist. Returning...')
            return false
        }

        // create it.
        debug(obj.ID.withoutHex + ': Task doesn\'t exist, create it');

        obj.name = fromMagento.data.customer_firstname + ' ' + fromMagento.data.customer_lastname
        obj.email = fromMagento.data.customer_email
        obj.phone = fromMagento.data.customer_telephone
        obj.dateOfOrder = MOMENT.unix(fromMagento.order_created_at).format('Do MMMM YYYY, h:mm:ss a')
        obj.paymentMethod = fromMagento.data.payment_method

        obj.address = fromMagento.data.shipping_address
        if (fromMagento.data.delivery_date) {
            obj.deliveryDate = MOMENT.unix(fromMagento.data.delivery_date).format('YYYY-MM-DD')
            obj.deliveryDateFull = MOMENT.unix(fromMagento.data.delivery_date).format('Do MMMM YYYY, dddd')
        }
        obj.deliveryTime = fromMagento.data.delivery_time
        obj.deliveryComments = fromMagento.data.delivery_comments

        obj.items = (function(items) {
            let itemBody = '# Purchase'
            for(let i=0; i<items.length; i++) {
                let item = items[i]
                itemBody += '\n\n## ' + (i+1) + '. ' + item.name

                if (item.product_description && item.product_description.length > 0) {
                    itemBody += '\n(Description: ' + item.product_description + ')'
                }

                var optionKeys = []
                if (item.Options) optionKeys = Object.keys(item.Options)
                if (optionKeys.length > 0) {
                    for(let i=0; i<optionKeys.length; i++) {
                        let key = optionKeys[i]
                        let option = item.Options[key]
                        itemBody += '\n' + key + ': ' + option
                    }
                }

                itemBody += '\nSKU: ' + item.sku
                itemBody += '\nQty: ' + item['Ordered Qty']
                itemBody += '\nPrice: ' + item.Price
                itemBody += '\nSubtotal: ' + parseFloat(item['Ordered Qty']) * parseFloat(item.Price)
            }
            return itemBody
        })(fromMagento.items)

        obj.comments = (function(comments) {

            if (comments.length < 1) return ''

            let commentBody = '\n\n\n# Comment'
            for(let i=0; i<comments.length; i++) {
                let comment = comments[i]
                commentBody += '\n\n## ' + comment.created_at
                commentBody += '\n' + comment.comment
            }

            return commentBody

        })(fromMagento.order_comments)

        obj.totals = fromMagento.totals

        /* TITLE */

        let title = obj.ID.stub


        let icons = ' '

        if (obj.paymentMethod.toLowerCase() === 'bank transfer') icons += '💵'

        // for sofa, add logo
        let sofa = _.find(fromMagento.items, (item) => {
            if (typeof item.sku === 'string') {
                return item.sku.toLowerCase().indexOf('sofa') > -1
            }
        })
        if (sofa) icons += '🛋'

        let mila = _.find(fromMagento.items, (item) => {
            if (typeof item.sku === 'string') {
                return item.sku.toLowerCase().indexOf('mila') > -1
            }
        })
        if (mila) icons += '👕'

        if (icons.length > 1) title += icons

        // title += ' ,'  + obj.name // the address already has the name
        // if (obj.address && obj.address.length > 0 ) title += ', ' + obj.name
        // title += ' ,' + obj.phone // the address also already has the telephone
        let titleShort = title + ', ' + obj.name
        let titleLong = title + ', ' + obj.address

        /* BODY */
        let body = obj.items


        body += '\n\n\n# ' + titleLong

        body += '\n\n\n# Info'
        body += '\nSales Order: ' + obj.ID.stub
        body += '\nName: ' + obj.name
        body += '\nEmail: ' + obj.email
        body += '\nPhone: ' + obj.phone
        body += '\nDate of order: ' + obj.dateOfOrder
        body += '\nMethod: ' + obj.paymentMethod

        // if there are comments
        if (obj.order_comment && obj.order_comment.length > 0) body += obj.order_comment

        // there can be non-deliverable products. So if have address will put
        if (obj.address && obj.address.length > 0) {
            body += '\n\n\n# Delivery'
            body += '\nAddress: ' + obj.address
            body += '\nDelivery date: ' + (obj.deliveryDateFull || 'Not indicated')
            body += '\nTime: ' + (obj.deliveryTime || 'Not indicated')
            if (obj.delivery_comments && obj.delivery_comments.length > 0) body += '\nComment: ' + obj.delivery_comments
        }

        body += '\n\n\n# Totals'
        body += '\n\n## Subtotals'
        body += '\nWithout tax: ' + obj.totals.subtotal
        body += '\nWith tax: ' + obj.totals.subtotal_incl_tax
        body += '\n\n## Shipment'
        body += '\nWithout tax: ' + obj.totals.shipping_amount
        body += '\nWith tax: ' + obj.totals.shipping_incl_tax
        body += '\n\n## Grand totals'
        body += '\nWithout tax: ' + obj.totals.grand_total
        body += '\nWith tax: ' +  obj.totals.grand_total_incl_tax

        body += obj.comments

        var taskObject = {
            'list_id': parseInt(process.env.WL_LIST_ID_FOR_SALES_DELIVERY),
            'title': titleShort,
            'starred': true
        }
        if (obj.deliveryDate) taskObject.due_date = obj.deliveryDate;

        // pust taskObject to wunderlist
        debug(obj.ID.withoutHex + ': Creating a task in wunderlist with taskObject:');
        debug(JSON.stringify(taskObject))

        return createTask(taskObject).then(taskData => {

            TASK_DATA = taskData

            let promises = []

            debug(obj.ID.withoutHex + ': Respond from WL in creating task:');
            debug(JSON.stringify(taskData));

            // create the note
            var noteObject = {
                "task_id": taskData.id,
                "content": body
            };

            // add the note.
            debug(obj.ID.withoutHex + ': Adding note...');

            promises.push(createTaskNote(noteObject))


            // create subtasks for bank transfer
            if (obj.paymentMethod.toLowerCase() === 'bank transfer') {
                debug('Bank transfer detected. Creating subtask...')
                let verifySubtask = createSubtask({
                    'task_id': taskData.id,
                    'title': 'Verify bank transfer: ' + obj.totals.grand_total_incl_tax
                })
                promises.push(verifySubtask)
            } else { promises.push(false) }

            return promises

        }).spread((noteData, subtask)=> {

            debug(obj.ID.withoutHex + ': Respond from WL in creating note:');
            debug(JSON.stringify(noteData));

            if(subtask) {
                debug(obj.ID.withoutHex + ': Respond from WL in creating subtask:');
                debug(JSON.stringify(subtask));
            }

            let options = {}

            // make the DB entry
            debug(obj.ID.withoutHex + ': Adding entry to own db.');

            if (!TASK_DATA) {
                let error = new Error('`TASK_DATA` is empty.')
                error.status = 500
                throw error
            }

            //dbTask is an object if the task exists in DB but was deleted off wunderlist
            if (typeof dbTask !== 'string') {
                return dbTask.destroy()
            } else { return false }

        }).then(() => {

            return DB.WunderlistTask.create({
                WunderlistTaskID: TASK_DATA.id,
                salesOrderID: obj.ID.default
            }, { transaction: D.get(options, 'transaction') }).then((listTask) => {

                debug(obj.ID.withoutHex + ': Entry added successfully. WunderlistTaskID: ' + listTask.WunderlistTaskID + ' SalesOrderID: ' + listTask.salesOrderID);
                return listTask

            }).catch(function(err) {
                console.log('CRITICAL: ' + obj.ID.stub + ' adding to db errored! Error is: ' + JSON.stringify(err));
                throw err
            })


        })

    })

}

module.exports = createWunderlistTask;
