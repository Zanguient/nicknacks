const debug = require('debug')('nn:apps:wunderlistBot:promises:createTaskComment')
debug.log = console.log.bind(console)

function createTaskComment(payload) {
    return new PROMISE(function(resolve, reject) {
        WL.http.task_comments.create(payload).done((data, statusCode) => {
            if(statusCode !== 201) {
                let error = new Error('Wunderlist comment creation error with statusCode: ' + statusCode)
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
module.exports = createTaskComment
