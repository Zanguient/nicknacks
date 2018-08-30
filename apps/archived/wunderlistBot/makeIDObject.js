'use strict';

function makeIDObject(subject) {

    var ID = subject.substring(subject.indexOf('#'), subject.indexOf('#') + 11);

    var obj = {
        default: ID
    };

    for(var i=2; i < ID.length; i++) {
        if(ID[i] === "0") continue;
        obj.stub = "#" + ID.substring(i, ID.length);
        break;
    }

    obj.withoutHex = parseInt(ID.substring(1, ID.length));

    return obj;
}

module.exports = makeIDObject;