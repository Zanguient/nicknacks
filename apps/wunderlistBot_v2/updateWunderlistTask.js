'use strict';

const debug = require('debug')('wunderlistBot:updateWunderlistTask')
debug.log = console.log.bind(console)

const makeIDObject = require('./makeIDObject.js')
const _ = require('lodash')
const getTaskByID = require('./promises/getTaskByID')
const createTaskComment = require('./promises/createTaskComment')
const updateTask = require('./promises/updateTask')
const prepareComments = require('./prepareComments')
const createSubtask = require('./promises/createSubtask')
const updateTitleDeliveryProvider = require('./updateTitleDeliveryProvider.js')


function updateWunderlistTask(fromMagento, options) {

    let obj = {}
    obj.ID = makeIDObject(fromMagento.order_id)

    debug('Initiating process for: ' + obj.ID.withoutHex)

    var _TASK_ID

    // first time if the task exist on DB
    return DB.WunderlistTask.find({
        where: { salesOrderID: obj.ID.default }
    }).then(task => {

        if (!task) {
            let error = new Error('Wunderlist task on DB not found. Please make sure `Order` webhook is working and resend it.')
            error.status = 400
            throw error
        }

        _TASK_ID = parseInt(task.WunderlistTaskID)

        return getTaskByID(_TASK_ID)

    }).then(wunderlistTask => {

        if (!wunderlistTask.id) {
            let error = new Error('Wunderlist task on WL not found. Please make sure `Order` webhook is working and task exists on Wunderlist App.')
            error.status = 500
            throw error
        }

        // it exists on DB and on WL, create the comment it.
        debug(obj.ID.withoutHex + ': Creating comment and updating task')

        /* COMMENTS */
        let commentPayload = {
            'task_id': parseInt(wunderlistTask.id),
            'text': prepareComments(fromMagento)
        }

        // update task with comment
        // creating comment will change the wunderlist revision. so have to do this sequentially.
        return createTaskComment(commentPayload)

    }).then(comment => {

        return getTaskByID(_TASK_ID)

    }).then(wunderlistTask => {

        /* TASK UPDATES AND STARRING */

        // NOTE: ONLY ORDER COMMENT, DELIVERY ORDER, or DELIVERY ORDER COMMENT updates due date (delivery date) and starred (delivery arranged)

        if (['ordercomment', 'shipment', 'shipmentcomment'].indexOf(fromMagento.type.toLowerCase()) !== -1) {

            // we also need to update the task attributes after adding the comment
            let deliveryDate = (fromMagento.data.delivery_date) ? MOMENT.unix(fromMagento.data.delivery_date).format('YYYY-MM-DD') : false

            // only for ordercomment, we consider delivery to revert back to starred, which means delivery not arranged
            // for all the rest, we consider it to be beyond delivery arrangement phase
            let starred = (fromMagento.type.toLowerCase() === 'ordercomment') ? true : false

            // amending title to indicated which delivery service tagged
            // if nothing changed in the title, it will not update wunderlist
            let updatedTitle = false
            if (['shipment', 'shipmentcomment'].indexOf(fromMagento.type.toLowerCase()) !== -1) {
                updatedTitle = updateTitleDeliveryProvider(fromMagento, wunderlistTask)
            }

            if (wunderlistTask.due_date !== deliveryDate || wunderlistTask.starred !== starred || updatedTitle !== false) {
                debug(obj.ID.withoutHex + ': Updating task because either `due_date` or `starred` is different. With payload:')
                let taskUpdatePayload = {
                    due_date: deliveryDate,
                    starred: starred
                }

                if (updatedTitle) {
                    taskUpdatePayload.title = updatedTitle
                }

                debug(taskUpdatePayload)
                return updateTask(wunderlistTask.id, wunderlistTask.revision, taskUpdatePayload)
            } else {
                return false
            }
        }
    }).then(() => {

        // write this as a separate module
        if (['shipment', 'shipmentcomment'].indexOf(fromMagento.type.toLowerCase()) !== -1) {

            let promises = []

            if(Array.isArray(fromMagento.trackinginfo) && fromMagento.trackinginfo.length > 0 ) {

                for(let i=0; i<fromMagento.trackinginfo.length; i++) {
                    let tracking = fromMagento.trackinginfo[i]
                    let title = tracking.title + ' (' + tracking.number + ')'

                    promises.push(createSubtask({
                        'task_id': _TASK_ID,
                        'title': title
                    }))
                }

                return PROMISE.all(promises)
            }

        } else {
            return false
        }

    })

}

module.exports = updateWunderlistTask;
