// accepts value as String or number

// returns false for invalid value, return String in with 2 decimal places for valid value


function checkValidCurrencyFormat(value) {

    // if type of value is number, cast it to string for regex check.
    if( typeof value === 'number' ) {
        value = value.toString()
    } else if ( typeof value !== 'string') {
        // else if it is not in string, means it is either null, undefined or any other kind of falsey.
        return false
    }

    // check regex
    let regex = /^[0-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/
    if (!regex.test(value)) return false

    return parseFloat(value).toFixed(2)

}
module.exports = checkValidCurrencyFormat
