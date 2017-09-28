'use strict';

function makeIDObject(ID) {

    var obj = {
        default: ID
    };

    for(var i=3; i < ID.length; i++) {
        if(ID[i] === "0") continue;
        obj.stub = "#" + ID.substring(i, ID.length);
    }

    obj.withoutHex = parseInt(ID.substring(1, ID.length));

    return obj;
}

module.exports = makeIDObject;