// accepts value as String or number

// returns false for invalid value, return String in with 2 decimal places for valid value


function apiErrorHandler(err, req, res, next, config) {

    res.status(D.get(err, 'status') || 500);

    // use simple timestamps to mark 500 errors.
    let timestamp = (new Date()).getTime()

    // severity
    let severityDefaults = ['high', 'medium', 'low']

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
    console.log('**END OUTPUT**')
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^')

    // default responseObject
    var responseObject = {
        success: false,
        message: 'Server error: ' + D.get(err, 'message') +' Please check console log. (' + timestamp + ')',
        error: {
            timestamp: timestamp
        }
    }

    // MODIFIERS
    if (D.get(config, 'message')) responseObject.message = D.get(config, 'message')
    if (D.get(config, 'message') && D.get(config, 'attachTimeStampToResponse') === true) responseObject.message += ' (TS:' + timestamp + ')'

    // if in development mode, we can attach the error in our reponse, on top of already printing it into the
    // server logs.
    if (process.env.NODE_ENV === 'development') {
        responseObject.error.message = D.get(err, 'message')
        responseObject.error.debug = err
    }

    // pass the timestamp to the frontend.
    return res.send(responseObject)

}
module.exports = apiErrorHandler
