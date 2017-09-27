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

const extractDate = require('./extractDate.js');

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

            /*
                1. Sales order
                2. Update to sales order
                3. Delivery order
                4. Update to delivery order

            */


        if (subject.indexOf('Your Grey and Sanders order confirmation') === 0) {
            
            // 1.  SALES ORDER  

            // create wunderlist task, and make association in our own database.
            (function(shortID, ID, name, $body) {

                var taskObject = {
                    'list_id': parseInt(process.env.WL_LIST_ID_FOR_SALES_DELIVERY),
                    'title': shortID + ', ' + name,
                    'starred': true
                };

                var dateOfDelivery = extractDate($body, 'YYYY-MM-DD');
                if (dateOfDelivery) taskObject.due_date = dateOfDelivery;

                var TASK_DATA;
                wunderlistAPI.http.tasks.create(taskObject).done(function(taskData, statusCode) {
                    if(statusCode !== 201) {
                        return console.log('CRITICAL: ' + shortID + ' errored with statusCode = ' + statusCode);
                    }

                    TASK_DATA = taskData;

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

                        // make the DB entry
                        return DB.WunderlistTask.findOrCreate({
                            where: { WunderlistTaskID: TASK_DATA.id },
                            defaults: { salesOrderID: ID.substring(1, ID.length) }
                        }).catch(function(err) {
                            console.log('CRITICAL: ' + shortID + ' adding to db errored! Error is: ' + JSON.stringify(err));
                        });


                    }).fail(function(resp, code) {
                        console.log('CRITICAL: ' + shortID + 'adding note errored! Error response is: ' + JSON.stringify(resp));
                    });

                }).fail(function(resp, code) {
                    console.log('CRITICAL: ' + shortID + ' creation errored! Error response is: ' + JSON.stringify(resp));
                });


            })(shortID, ID, name, $body)

        } else if (subject.indexOf('Update to your Grey and Sanders order') === 0) {

            // 2. UPDATE TO SALES ORDER

            (function (shortID, ID, name, $body) {

                DB.WunderlistTask.find({
                    where: { salesOrderID: ID.substring(1, ID.length) }
                }).then(function(wunderlist) {


                    if(!wunderlist) return console.log('WARN: ' + shortID + ' not found in database to update comments.');



                    // check if there is any dates, if not don't need to update the task, only comments
                    var dateOfDelivery = extractDate($body, 'YYYY-MM-DD');

                    if (dateOfDelivery) {
                        // get the wunderlist to update it
                        wunderlistAPI.http.tasks.getID(wunderlist.WunderlistTaskID).done(function(taskData, statusCode) {
                            
                            if (statusCode !== 200) return console.log('WARN: ' + shortID + ' error in retrieving wunderlist: ' + statusCode);

                            wunderlistAPI.http.tasks.update(taskData.id, taskData.revision + 1, { 'due_date': dateOfDelivery });

                        }).fail(function(resp, code) {
                            console.log('CRITICAL: ' + shortID + ' wunderlist retrieval error! Error response is: ' + JSON.stringify(resp));
                        });
                    }




                    // now update the comments

                    // prepare the comments
                    var textBlock = '!!UPDATES!!\n\nShipping info: \n\n:';

                    textBlock += htmlToText.fromString($body('body').find('#shippingInformation').html(), {
                        wordwrap: 130,
                        ignoreImage: true,
                        ignoreHref: true
                    });

                    textBlock += "\n\n";

                    if ($body('body').find('#comment').html()) {
                        textBlock += 'Other comments: \n\n';
                        textBlock += htmlToText.fromString($body('body').find('#comment').html(), {
                            wordwrap: 130,
                            ignoreImage: true,
                            ignoreHref: true
                        });
                    }
                    // create the comments
                    wunderlistAPI.http.task_comments.create({
                        'task_id': wunderlist.WunderlistTaskID,
                        'text': textBlock
                    }).done(function(taskCommentData, statusCode) {
                    
                            if (statusCode !== 201) return console.log('WARN: ' + shortID + ' error in adding comment: ' + statusCode);

                    }).fail(function(resp, code) {
                        console.log('CRITICAL: ' + shortID + ' wunderlist add comment err! Error response is: ' + JSON.stringify(resp));
                    });


                }).catch(function(err) {
                    console.log('WARN: ' + shortID + ' error in locating database record: ' + JSON.stringify(err));
                });

            })(shortID, ID, name, $body)

        } else if (subject.indexOf('Your Grey and Sanders order (') === 0 && subject.indexOf('is scheduled for delivery') !== -1) {

            // 3. DELIVERY ORDER

            (function (shortID, ID, name, $body) {

                DB.WunderlistTask.find({
                    where: { salesOrderID: ID.substring(1, ID.length) }
                }).then(function(wunderlist) {

                    if(!wunderlist) return console.log('WARN: ' + shortID + ' not found in database to make delivery.');

                    // check if there is any dates, if not don't need to update the task, only comments
                    var dateOfDelivery = extractDate($body, 'YYYY-MM-DD');

                    if (dateOfDelivery) {
                        // get the wunderlist to update it
                        wunderlistAPI.http.tasks.getID(wunderlist.WunderlistTaskID).done(function(taskData, statusCode) {
                            
                            if (statusCode !== 200) return console.log('WARN: ' + shortID + ' error in retrieving wunderlist: ' + statusCode);

                            wunderlistAPI.http.tasks.update(taskData.id, taskData.revision + 1, { 'due_date': dateOfDelivery, starred: 'false' });

                        }).fail(function(resp, code) {
                            console.log('CRITICAL: ' + shortID + ' wunderlist retrieval error! Error response is: ' + JSON.stringify(resp));
                        });
                    }

                    // now update the comments

                    // prepare the comments
                    var textBlock = '!!SHIPPED!!\n\nShipping info: \n\n:';

                    textBlock += htmlToText.fromString($body('body').find('#shippingInformation').html(), {
                        wordwrap: 130,
                        ignoreImage: true,
                        ignoreHref: true
                    });

                    textBlock += "\n\n";

                    if ($body('body').find('#comment').html()) {
                        textBlock += 'Other comments: \n\n';
                        textBlock += htmlToText.fromString($body('body').find('#comment').html(), {
                            wordwrap: 130,
                            ignoreImage: true,
                            ignoreHref: true
                        });
                    }
                    // create the comments
                    wunderlistAPI.http.task_comments.create({
                        'task_id': wunderlist.WunderlistTaskID,
                        'text': textBlock
                    }).done(function(taskCommentData, statusCode) {
                    
                            if (statusCode !== 201) return console.log('WARN: ' + shortID + ' error in adding comment: ' + statusCode);

                    }).fail(function(resp, code) {
                        console.log('CRITICAL: ' + shortID + ' wunderlist add comment err! Error response is: ' + JSON.stringify(resp));
                    });


                }).catch(function(err) {
                    console.log('WARN: ' + shortID + ' error in locating database record: ' + JSON.stringify(err));
                });

            })(shortID, ID, name, $body)

        } else if (subject.indexOf('Update to your Grey and Sanders delivery') === 0) {

            // 4. UPDATES TO DELIVERY ORDER

            (function (shortID, ID, name, $body) {

                DB.WunderlistTask.find({
                    where: { salesOrderID: ID.substring(1, ID.length) }
                }).then(function(wunderlist) {

                    if(!wunderlist) return console.log('WARN: ' + shortID + ' not found in database to update delivery.');

                    // check if there is any dates, if not don't need to update the task, only comments
                    var dateOfDelivery = extractDate($body, 'YYYY-MM-DD');

                    if (dateOfDelivery) {
                        // get the wunderlist to update it
                        wunderlistAPI.http.tasks.getID(wunderlist.WunderlistTaskID).done(function(taskData, statusCode) {
                            
                            if (statusCode !== 200) return console.log('WARN: ' + shortID + ' error in retrieving wunderlist: ' + statusCode);

                            wunderlistAPI.http.tasks.update(taskData.id, taskData.revision + 1, { 'due_date': dateOfDelivery, starred: 'false' });

                        }).fail(function(resp, code) {
                            console.log('CRITICAL: ' + shortID + ' wunderlist retrieval error! Error response is: ' + JSON.stringify(resp));
                        });
                    }

                    // now update the comments

                    // prepare the comments
                    var textBlock = '!!UPDATES TO SHIPPING!!\n\nShipping info: \n\n:';

                    textBlock += htmlToText.fromString($body('body').find('#shippingInformation').html(), {
                        wordwrap: 130,
                        ignoreImage: true,
                        ignoreHref: true
                    });

                    textBlock += "\n\n";

                    if ($body('body').find('#comment').html()) {
                        textBlock += 'Other comments: \n\n';
                        textBlock += htmlToText.fromString($body('body').find('#comment').html(), {
                            wordwrap: 130,
                            ignoreImage: true,
                            ignoreHref: true
                        });
                    }
                    // create the comments
                    wunderlistAPI.http.task_comments.create({
                        'task_id': wunderlist.WunderlistTaskID,
                        'text': textBlock
                    }).done(function(taskCommentData, statusCode) {
                    
                            if (statusCode !== 201) return console.log('WARN: ' + shortID + ' error in adding comment: ' + statusCode);

                    }).fail(function(resp, code) {
                        console.log('CRITICAL: ' + shortID + ' wunderlist add comment err! Error response is: ' + JSON.stringify(resp));
                    });


                }).catch(function(err) {
                    console.log('WARN: ' + shortID + ' error in locating database record: ' + JSON.stringify(err));
                });

            })(shortID, ID, name, $body)

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