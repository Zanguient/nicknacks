'use strict';

const extractDate = require('./extractDate.js');
const htmlToText = require('html-to-text');
const debug = require('debug')('wunderlistBot:createOrUpdateWunderlistTask');

/*
ID.stub (string): #XXX
ID (string): #2000000XXX
name (string): customer name
starred (bool): to star the task or not. by conversation, fresh orders without delivery arranged are starred.


Note to self:

Basically there are two things that can happen to an email that comes through.

Any email can create a task: because the to process to integrate with magento
uses email and not 100% reliable. So at least if sales orders are missed out,
we might catch it later, rather reject later emails from creating tasks.

But once a task pertaining to a Sales Order ID is created, it can only be updated
and no longer will create new tasks.

*/
function createOrUpdateWunderlistTask(ID, name, to, address, $body, starred, commentToAdd) {

    debug('Initiating process for: ' + ID.withoutHex);

    // DATE
    // date can sometimes be missing when orders are created using the backend.
    var dateOfDelivery = extractDate($body, 'YYYY-MM-DD');

    var title = ID.stub + ', ';

    title += (to) ? to + ', ': '';
    // if the address is valid, add the address (which has name)
    // else just add name
    title += (address) ? address : name;

    DB.WunderlistTask.find({
        where: { salesOrderID: ID.withoutHex }
    }).then(function(task) {

        if (!task) {

            debug(ID.withoutHex + ': Task doesn\'t exist, create it');

            var taskObject = {
                'list_id': parseInt(process.env.WL_LIST_ID_FOR_SALES_DELIVERY),
                'title': title,
                'starred': starred
            };
            if (dateOfDelivery) taskObject.due_date = dateOfDelivery;

            // pust taskObject to wunderlist
            debug(ID.withoutHex + ': Creating a task in wunderlist with taskObject:');
            debug(JSON.stringify(taskObject));

            WL.http.tasks.create(taskObject).done(function(taskData, statusCode) {

                debug(ID.withoutHex + ': Respond from WL in creating task:');
                debug(JSON.stringify(taskData));

                if(statusCode !== 201) return console.log('CRITICAL: ' + ID.stub + ' errored with statusCode = ' + statusCode);

                // create the note
                var noteObject = {
                    "task_id": taskData.id,
                    "content": htmlToText.fromString($body('body').html(), {
                        wordwrap: 130,
                        ignoreImage: true,
                        ignoreHref: true
                    })
                };

                // add the note.
                debug(ID.withoutHex + ': Adding note...');
                WL.http.notes.create(noteObject).done(function(noteData, statusCode) {

                    debug(ID.withoutHex + ': Respond from adding note:');
                    debug(JSON.stringify(noteData));

                    if (statusCode !== 201) return console.log('CRITICAL: ' + ID.stub + ' note creation errored with statusCode = ' + statusCode);

                }).fail(function(resp, code) {
                    console.log('CRITICAL: ' + ID.stub + 'adding note errored! Error response is: ' + JSON.stringify(resp));
                });


                // make the DB entry
                debug(ID.withoutHex + ': Adding entry to own db.');
                DB.WunderlistTask.create({
                    WunderlistTaskID: taskData.id,
                    salesOrderID: ID.withoutHex
                }).then(function(listTask) {
                    debug(ID.withoutHex + ': Entry added successfully. WunderlistTaskID: ' + listTask.WunderlistTaskID + ' SalesOrderID: ' + listTask.salesOrderID);
                }).catch(function(err) {
                    console.log('CRITICAL: ' + ID.stub + ' adding to db errored! Error is: ' + JSON.stringify(err));
                });


            }).fail(function(resp, code) {
                console.log('CRITICAL: ' + ID.stub + ' creation errored! Error response is: ' + JSON.stringify(resp));
            });


        } else {

            debug(ID.withoutHex + ': Task already exist.');
            // if task already exist, (1) COMMENT on the existing task
            // and update the (2) DUE DATE or (3) STARRED flag according


            // COMMENT
            // if there is a designated comment to add, we add the comment
            // else we dump the contents of the email in.
            // GOTCHA: wunderlistjs needs #parseInt here. Inconsistency
            var commentObject = { 'task_id': parseInt(task.WunderlistTaskID) };

            if (commentToAdd) {
                commentObject.text = commentToAdd;
            } else {
                commentObject.text = htmlToText.fromString($body('body').html(), {
                    wordwrap: 130,
                    ignoreImage: true,
                    ignoreHref: true
                })
            }

            // create the comments
            debug(ID.withoutHex + ': Creating comment.');
            WL.http.task_comments.create(commentObject).done(function(taskCommentData, statusCode) {

                debug(ID.withoutHex + ': WL comment response:');
                debug(JSON.stringify(taskCommentData));

                if (statusCode !== 201) return console.log('WARN: ' + ID.stub + ' error in adding comment: ' + statusCode);


                debug(ID.withoutHex + ': Getting task to check whether to star/unstar and update delivery date.');
                // GOTCHA: Because updating comments will cascade a new revision index to the Task, this updating of
                //         task attributes needs to occur sequentially after the task comments have been inserted.

                WL.http.tasks.getID(task.WunderlistTaskID).done(function (taskData, statusCode) {

                    debug(ID.withoutHex + ': WL Task retrieval response:');
                    debug(JSON.stringify(taskData));

                    if (statusCode !== 200) return console.log('WARN: ' + ID.stub + ' error getting task: ' + statusCode);

                    var taskUpdateObject = {
                        'due_date': dateOfDelivery,
                        'starred': starred
                    };

                    // only update the task if things are different.
                    if (taskUpdateObject.due_date !== taskData.due_date || taskUpdateObject.starred !== taskData.starred) {

                        debug(ID.withoutHex + ': Updating task because either `due_date` or `starred` is different.');

                        WL.http.tasks.update(taskData.id, taskData.revision, taskUpdateObject).done(function(taskData, statusCode) {

                            debug(ID.withoutHex + ': WL task update response.');
                            debug(JSON.stringify(taskData));

                            if (statusCode !== 200) return console.log('WARN: ' + ID.stub + ' updating task: ' + statusCode);
                        }).fail(function(resp, code) {
                            console.log('CRITICAL: ' + ID.stub + ' wunderlist update task err! Error response is: ' + JSON.stringify(resp));
                        });
                    }

                }).fail(function (resp, code) {
                    console.log('CRITICAL: ' + ID.stub + ' wunderlist get task err! Error response is: ' + JSON.stringify(resp));
                });

            }).fail(function(resp, code) {
                console.log('CRITICAL: ' + ID.stub + ' wunderlist add comment err! Error response is: ' + JSON.stringify(resp));
                console.log('commentObject is ' + JSON.stringify(commentObject));
            });

        }
    }).catch(function(err) {
        console.log('CRITICAL: ' + ID.stub + ' adding to db errored! Error is: ' + JSON.stringify(err));
    });

}

module.exports = createOrUpdateWunderlistTask;
