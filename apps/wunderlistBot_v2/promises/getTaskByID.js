const debug = require('debug')('apps:wunderlistBot:promises:getTaskByID')

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
            let error = new Error(D.get(resp, 'error.message'))
            error.WLResp = resp
            error.WLResp.code = code
            // we want 404 to resolve...
            if (code == 404) resolve({ resp: resp, code: code })
            reject(error)
        })
    })
}
module.exports = getTaskByID
