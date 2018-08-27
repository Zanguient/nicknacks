'use strict';

const debug = require('debug')('wunderlistBot:updateWunderlistTask')
const makeIDObject = require('./makeIDObject.js')
const _ = require('lodash')
const getTaskByID = require('./promises/getTaskByID')
const createTaskComment = require('./promises/createTaskComment')
const updateTask = require('./promises/updateTask')
const prepareComments = require('./prepareComments')


function updateWunderlistTask(fromMagento, options) {

    let obj = {}
    obj.ID = makeIDObject(fromMagento.order_id)

    debug('Initiating process for: ' + obj.ID.withoutHex)

    // first time if the task exist on DB
    return DB.WunderlistTask.find({
        where: { salesOrderID: obj.ID.default }
    }).then(task => {

        if (!task) {
            let error = new Error('Wunderlist task on DB not found. Please make sure `Order` webhook is working and resend it.')
            error.status = 400
            throw error
        }

        return getTaskByID(parseInt(task.WunderlistTaskID))

    }).then(wunderlistTask => {

        if (!wunderlistTask.id) {
            let error = new Error('Wunderlist task on WL not found. Please make sure `Order` webhook is working and task exists on Wunderlist App.')
            error.status = 500
            throw error
        }

        // it exists on DB and on WL, create the comment it.
        debug(obj.ID.withoutHex + ': Creating comment and updating task')


        var promises = []

        /* COMMENTS */
        let commentPayload = {
            'task_id': parseInt(wunderlistTask.id),
            'text': prepareComments(fromMagento)
        }

        // update task with comment
        promises.push(createTaskComment(commentPayload))


        /* TASK UPDATES AND STARRING */

        // NOTE: ONLY ORDER COMMENT, DELIVERY ORDER, or DELIVERY ORDER COMMENT updates due date (delivery date) and starred (delivery arranged)

        if (['ordercomment', 'shipment', 'shipmentcomment'].indexOf(fromMagento.type.toLowerCase()) !== -1) {
            // we also need to update the task attributes after adding the comment
            let deliveryDate = (fromMagento.data.delivery_date) ? MOMENT.unix(fromMagento.data.delivery_date).format('YYYY-MM-DD') : false

            // only for ordercomment, we consider delivery to revert back to starred, which means delivery not arranged
            // for all the rest, we consider it to be beyond delivery arrangement phase
            let starred = (fromMagento.type.toLowerCase() === 'ordercomment') ? true : false

            if (wunderlistTask.due_date !== deliveryDate || wunderlistTask.starred !== starred) {
                debug(obj.ID.withoutHex + ': Updating task because either `due_date` or `starred` is different. With payload:')
                let taskUpdatePayload = {
                    due_date: deliveryDate,
                    starred: starred
                }
                debug(taskUpdatePayload)
                promises.push(updateTask(wunderlistTask.id, wunderlistTask.revision, taskUpdatePayload))
            }

        }
        return PROMISE.all(promises)

    })

}

module.exports = updateWunderlistTask;
