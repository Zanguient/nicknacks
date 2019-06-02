const debug = require('debug')('nn:apps:wunderlistBot:promises:createSubtask')
debug.log = console.log.bind(console)

function createSubtask(payload) {
    return new PROMISE(function(resolve, reject) {
        WL.http.subtasks.create(payload).done((data, statusCode) => {
            if(statusCode !== 201) {
                let error = new Error('Wunderlist subtask creation error with statusCode: ' + statusCode)
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

module.exports = createSubtask
