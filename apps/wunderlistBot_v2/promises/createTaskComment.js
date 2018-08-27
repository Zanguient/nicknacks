const debug = require('debug')('apps:wunderlistBot:promises:createTaskComment')

function createTaskComment(payload) {
    return new PROMISE(function(resolve, reject) {
        WL.http.task_comments.create(payload).done((data, statusCode) => {
            if(statusCode !== 201) {
                let error = new Error('Wunderlist comment creation error with statusCode: ' + statusCode)
                error.status = 500
                reject(error)
            } else {
                debug(data)
                resolve(data)
            }
        }).fail((resp, code) => {
            let error = new Error(D.get(resp, 'error.message'))
            error.WLResp = resp
            error.WLResp.code = code
            reject(error)
        })
    })
}
module.exports = createTaskComment