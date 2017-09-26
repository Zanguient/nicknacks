'use strict';

function getShortID(ID) {
    for(var i=3; i < ID.length; i++) {
        if(ID[i] === "0") continue;
        return "#" + ID.substring(i, ID.length);
    }
}

module.exports = getShortID;