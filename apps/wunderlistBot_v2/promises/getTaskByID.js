const debug = require('debug')('nn:apps:wunderlistBot:promises:getTaskByID')
debug.log = console.log.bind(console)

function getTaskByID(payload) {
    return new PROMISE(function(resolve, reject) {
        WL.http.tasks.getID(payload).done((data, statusCode) => {
            if(statusCode !== 200) {
                let error = new Error('Wunderlist get task error with statusCode: ' + statusCode)
                error.status = 500
                debug(error)
                reject(error)
            } else {
                debug(data)
                resolve(data)
            }
        }).fail((resp, code) => {

            // we want 404 to resolve because 404 means the task cannot be found
            // rather than a URI/server failure
            if (code == 404) return resolve({ resp: resp, code: code })

            let error = new Error(D.get(resp, 'error.message'))

            error.WLResp = resp
            error.WLResp.code = code
            error.WLPayload = payload

            reject(error)
        })
    })
}
module.exports = getTaskByID
