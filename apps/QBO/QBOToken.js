const QuickBooks = require('node-quickbooks')
const rp = require('request-promise')
const parseString = require('xml2js').parseString

function retrieveTokenAndRefresh() {
    // get the token
    DB.Token.findById(1).then(function (token) {

        // check validity of token data.
        if (!token || !token.data || !token.data.oauth_token || !token.data.oauth_token_secret) {
            throw new Error('CRITICAL: Obtaining token from database failed.')
        }

        // save token to global variables
        global.QBO_ACCESS_TOKEN = token.data.oauth_token;
        global.QBO_ACCESS_TOKEN_SECRET = token.data.oauth_token_secret;


        // send request to attempt to refresh token

        // NOTE: Oauth Access tokens expire 180 days from the date they were created.
        //       Oauth token Reconnect API can be called between 151 days and 179 days
        //       (after 5 months and before expiry).

        var ageOfToken = MOMENT() - MOMENT(token.updatedAt);

        // ageOfToken > 160 days. (using 160 days to be safe.)
        if (ageOfToken > 1.382e+10) {
            return refreshQBOToken();
        } else {
            return false;
        }

    }).then(function() {

        console.log('QBO successfully initialised.')

        // initialise quickbooks
        global.QBO = new QuickBooks(
            process.env.qbo_consumerKey,
            process.env.qbo_consumerSecret,
            global.QBO_ACCESS_TOKEN,
            global.QBO_ACCESS_TOKEN_SECRET,
            process.env.qbo_realmID,
            false, // use the Sandbox
            true // turn debugging on
        )
        global.QBO = PROMISE.promisifyAll(global.QBO);

    }).catch(function (err) {
        // log the error
        throw err

    });



    // connect to quickbooks to refresh token. returns a promise
    function refreshQBOToken() {

        if (!global.QBO_ACCESS_TOKEN || !global.QBO_ACCESS_TOKEN_SECRET) throw new Error('CRITICAL: Failed to initalise tokens to the global namespace.');

        // send the request to quickbooks
        // this promise is returned to #retrieveTokenAndRefresh
        return rp({

            method: 'GET',
            uri: QuickBooks.APP_CENTER_BASE + '/api/v1/connection/reconnect',
            oauth: {
                consumer_key: process.env.qbo_consumerKey,
                consumer_secret: process.env.qbo_consumerSecret,
                token_secret: global.QBO_ACCESS_TOKEN_SECRET,
                token: global.QBO_ACCESS_TOKEN
            },
            json: true

        }).then(function (response) {

            // set the responseParsed store
            var responseParsed = {};

            // check if the response is not an Object
            if (typeof response === 'string') {
                parseString(response, function (err, result) {
                    if (err) {
                        throw new Error('Unable to parse valid XML response.')
                    }
                    // assign the parsedResponse
                    responseParsed = result.ReconnectResponse ? result.ReconnectResponse : result.PlatformResponse;
                });
            }

            // check if there is an error
            var errorCode = parseInt(responseParsed.ErrorCode[0]);

            if (errorCode === 212) {

                // token is not refreshed, return nothing, life goes on...
                console.log('CRITICAL: Token refresh is attempted and failed due to current token still valid.');

                // SEND EMAIL!!!!
                return false;

            } else if (errorCode === 0) {

                // token is refreshed. need update the globals and save to DB

                var token = {
                    "oauth_token_secret": responseParsed.OAuthTokenSecret[0],
                    "oauth_token": responseParsed.OAuthToken[0]
                };

                // set globals to the newly retrieved tokens
                global.QBO_ACCESS_TOKEN = responseParsed.OAuthToken[0];
                global.QBO_ACCESS_TOKEN_SECRET = responseParsed.OAuthTokenSecret[0];

                // refreshed token is updated to DB
                return DB.Token.update({
                    data: token
                }, {
                    where: {
                        TokenID: 1
                    }
                });

            } else {

                // SEND EMAIL!!!!

                // any other errorCode, print out the error.
                throw new Error('Error code: ' + responseParsed.ErrorCode[0] + ' Message: ' + responseParsed.ErrorMessage[0])

            }
        })
    }


    // attempt refresh every 1 week
    setInterval(retrieveTokenAndRefresh, 6.048e+8);
}
module.exports = retrieveTokenAndRefresh
