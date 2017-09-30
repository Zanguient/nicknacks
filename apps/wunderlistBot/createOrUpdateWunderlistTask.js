'use strict';

const extractDate = require('./extractDate.js');
const htmlToText = require('html-to-text');

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
function createOrUpdateWunderlistTask(ID, name, address, $body, starred, commentToAdd) {

    // DATE
    // date can sometimes be missing when orders are created using the backend.
    var dateOfDelivery = extractDate($body, 'YYYY-MM-DD');

    var title = ID.stub + ', ';
    // if the address is valid, add the address (which has name)
    // else just add name
    title += (address) ? address : name;

    DB.WunderlistTask.find({
        where: { salesOrderID: ID.withoutHex }
    }).then(function(task) {

        if (!task) {

            // task don't exist, create it

            var taskObject = {
                'list_id': parseInt(process.env.WL_LIST_ID_FOR_SALES_DELIVERY),
                'title': title,
                'starred': starred
            };
            if (dateOfDelivery) taskObject.due_date = dateOfDelivery;

            // pust taskObject to wunderlist
            WL.http.tasks.create(taskObject).done(function(taskData, statusCode) {
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
                WL.http.notes.create(noteObject).done(function(noteData, statusCode) {
                    if (statusCode !== 201) return console.log('CRITICAL: ' + ID.stub + ' note creation errored with statusCode = ' + statusCode);

                }).fail(function(resp, code) {
                    console.log('CRITICAL: ' + ID.stub + 'adding note errored! Error response is: ' + JSON.stringify(resp));
                });


                // make the DB entry
                DB.WunderlistTask.create({
                    WunderlistTaskID: taskData.id,
                    salesOrderID: ID.withoutHex
                }).catch(function(err) {
                    console.log('CRITICAL: ' + ID.stub + ' adding to db errored! Error is: ' + JSON.stringify(err));
                });


            }).fail(function(resp, code) {
                console.log('CRITICAL: ' + ID.stub + ' creation errored! Error response is: ' + JSON.stringify(resp));
            });


        } else {

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
            WL.http.task_comments.create(commentObject).done(function(taskCommentData, statusCode) {
            
                if (statusCode !== 201) return console.log('WARN: ' + ID.stub + ' error in adding comment: ' + statusCode);

            }).fail(function(resp, code) {
                console.log('CRITICAL: ' + ID.stub + ' wunderlist add comment err! Error response is: ' + JSON.stringify(resp));
                console.log('commentObject is ' + JSON.stringify(commentObject));
            });


            // also get the task and check whether to star or unstar and update delivery date
            WL.http.tasks.getID(task.WunderlistTaskID).done(function (taskData, statusCode) {

                if (statusCode !== 200) return console.log('WARN: ' + ID.stub + ' error getting task: ' + statusCode);

                var taskUpdateObject = {
                    'due_date': dateOfDelivery, 
                    'starred': starred
                };

                // only update the task if things are different.
                if (taskUpdateObject.due_date !== taskData.due_date || taskUpdateObject.starred !== taskData.starred) {
                    WL.http.tasks.update(taskData.id, taskData.revision + 1, taskUpdateObject).done(function(taskData, statusCode) {
                        if (statusCode !== 200) return console.log('WARN: ' + ID.stub + ' updating task: ' + statusCode);
                    }).fail(function(resp, code) {
                        console.log('CRITICAL: ' + ID.stub + ' wunderlist update task err! Error response is: ' + JSON.stringify(resp));
                    });
                }

            }).fail(function (resp, code) {
                console.log('CRITICAL: ' + ID.stub + ' wunderlist get task err! Error response is: ' + JSON.stringify(resp));
            });

        }
    }).catch(function(err) {
        console.log('CRITICAL: ' + ID.stub + ' adding to db errored! Error is: ' + JSON.stringify(err));
    });

}

module.exports = createOrUpdateWunderlistTask;