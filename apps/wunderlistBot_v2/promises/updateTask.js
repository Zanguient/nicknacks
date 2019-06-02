const debug = require('debug')('nn:apps:wunderlistBot:promises:updateTask')
debug.log = console.log.bind(console)

function updateTask(id, rev, payload) {
    return new PROMISE(function(resolve, reject) {
        WL.http.tasks.update(id, rev, payload).done((data, statusCode) => {
            if(statusCode !== 200) {
                let error = new Error('Wunderlist update task error with statusCode: ' + statusCode)
                error.status = 500
                debug(error)
                reject(error)
            } else {
                debug(data)
                resolve(data)
            }
        }).fail((resp, code) => {
            let error = new Error(D.get(resp, 'error.message'))
            error.WLResp = resp
            error.WLResp.code = code
            error.WLPayload = payload
            reject(error)
        })
    })
}
module.exports = updateTask
