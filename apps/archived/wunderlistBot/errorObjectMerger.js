'use strict';

function errorObjectMerger(master, subordinate) {

    // if the subordinate fails, the master must fail
    master.success = subordinate.success;

    master.error = subordinate.error;

    // the start of the error is where the first array object should be
    master.stack = subordinate.stack.concat(master.stack);

    return master;
}

module.exports = errorObjectMerger;