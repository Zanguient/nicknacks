// accepts value as String or number

// returns false for invalid value, return String in with 2 decimal places for valid value


function apiErrorHandler(err, req, res, next, config) {

    if(D.get(err, 'status') === 404) {
        return res.status(404).send({
            success: false,
            message: 'Not found.'
        })
    }

    res.status(D.get(err, 'status') || 500);

    // use simple timestamps to mark 500 errors.
    let timestamp = (new Date()).getTime()

    // severity
    let severityDefaults = ['high', 'medium', 'low']

    let toLog = !D.get(err, 'noLogging')

    if (toLog) {

        console.log('vvvvvvvvvvvvvvvvvvvvvvv')

        // if severity is defined
        let level = D.get(err, 'level') || D.get(config, 'level')
        if (level) {
            if (severityDefaults.indexOf(level) < 0) {
                console.log('**ERROR - HIGH ** Wrong error severity level defined. It can only be `high`, `medium or `low`.')
            }
        }

        // for level of severity. if not stated, assume critical
        level = level || 'high'

        // logging
        console.log('**API ERROR OUTPUT - ' + level.toUpperCase() + ' ** (TS: ' + timestamp + ')')
        console.log(D.get(err, 'message') || D.get(config, 'message'))
        console.log(err)

        // category dependent outputs
        if (err.category === 'QBO') {
            console.log('====================')
            console.log(err.category + ' error output:')
            console.log(JSON.stringify(err.QBOResponse))
        }

        console.log('**END OUTPUT**')
        console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^')

    }

    // default response
    let responseObject = {
        success: false,
        message: 'Server error: ' + D.get(err, 'message'),
        error: {
            timestamp: timestamp
        }
    }

    // MODIFIERS
    if (toLog) responseObject.message += ' Please check console log. (' + timestamp + ')'
    if (D.get(config, 'message')) responseObject.message = D.get(config, 'message')
    if (D.get(config, 'message') && D.get(config, 'attachTimeStampToResponse') === true) responseObject.message += ' (TS:' + timestamp + ')'

    // if in development mode, we can attach the error in our reponse, on top of already printing it into the
    // server logs.
    if (process.env.NODE_ENV === 'development') {
        responseObject.error.message = D.get(err, 'message')

        var cache = []
        responseObject.error.debug = JSON.stringify(err, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Duplicate reference found
                    try {
                        // If this value does not reference a parent it can be deduped
                        return JSON.parse(JSON.stringify(value));
                    } catch (error) {
                        // discard key if value cannot be deduped
                        return;
                    }
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        })
        cache = null
    }

    // pass the timestamp to the frontend.
    return res.send(responseObject)

}
module.exports = apiErrorHandler
