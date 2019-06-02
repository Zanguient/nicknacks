'use strict';

function updateTitleDeliveryProvider(fromMagento, wunderlistTask) {

    let wunderlistTitle = wunderlistTask.title

    let updatedTitle = false

    let isDeliverableByRenford = false
    let renfordEmoji = '✈'
    let wasDeliverableByRenford = (wunderlistTitle.indexOf(renfordEmoji) > -1)

    let isDeliverableByANB = false
    let anbEmoji = '🅰'
    let wasDeliverableByANB = (wunderlistTitle.indexOf(anbEmoji) > -1)

    if (Array.isArray(fromMagento.trackinginfo) && fromMagento.trackinginfo.length > 0 ) {

        for(let i=0; i<fromMagento.trackinginfo.length; i++) {
            let tracking = fromMagento.trackinginfo[i]

            // renford. we allow people to make some mistakes by matching loosely
            if (tracking.title.toLowerCase().indexOf('renford') === 0 ) {
                isDeliverableByRenford = true
            } else if (tracking.title.toLowerCase().indexOf('anb') === 0) {
                isDeliverableByANB = true
            }

        }

    }

    function endOfSalesOrderNumberPlusOne(string) {
        let start = string.indexOf('#')
        if (start === -1) {
            let error = new Error('Wunderlist title did not start with `#`. Please correct title convention and re-attempt. Failed to update delivery provider.')
            error.status = 400
            throw error
        }
        var endOfSalesOrderNumberPlusOne = 0
        for(let i=start+1; i<string.length; i++) {
            if(!Number.isInteger(parseInt(string[i]))) {
                endOfSalesOrderNumberPlusOne = i
                break
    		}
    	}
        if (endOfSalesOrderNumberPlusOne === 0) {
            let error = new Error('Wunderlist title sales order convention seems wrong. Please correct title convention and re-attempt. Failed to update delivery provider.')
            error.status = 400
            throw error
        }
        return endOfSalesOrderNumberPlusOne
    }

    function insertDeliveryEmoji(string, emoji, position) {
        return [string.slice(0, position), emoji, string.slice(position)].join('')
    }

    // if something has changed, it needs updating
    if ( (isDeliverableByRenford !== wasDeliverableByRenford) || (isDeliverableByANB !== wasDeliverableByANB) ) {
        if (isDeliverableByRenford && wunderlistTitle.indexOf(renfordEmoji) === -1) {
            updatedTitle = insertDeliveryEmoji(wunderlistTitle, renfordEmoji, endOfSalesOrderNumberPlusOne(wunderlistTitle))
        }

        if (isDeliverableByANB && wunderlistTitle.indexOf(anbEmoji) === -1) {
            updatedTitle = insertDeliveryEmoji((updatedTitle || wunderlistTitle), anbEmoji, endOfSalesOrderNumberPlusOne(wunderlistTitle))
        }
    }
    return updatedTitle

}

module.exports = updateTitleDeliveryProvider;
