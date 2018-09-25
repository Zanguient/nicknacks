'use strict';

const debug = require('debug')('nn:apps:passport:permit')
debug.log = console.log.bind(console)

function permit(parentPath, expressRouter) {

    // set the global object to build the access!
    D.set(global, 'accessRights.byPaths.' + parentPath, {})
    let parentPathObj = global.accessRights.byPaths[parentPath]

    return (childPath, routeRightsLevel) => {

        // if rightsLevel is not a number
        if (typeof routeRightsLevel !== 'number') {
            console.log('WARN: Permission for routing ' + parentPath + childPath + ' is not defined. The route will be open for free access. If this is not intended, please set permissions.')
        }

        // rights Level is a number
        if (routeRightsLevel < 0) {
            throw new Error('Rights specified for ' + parentPath + childPath + ' cannot be less than zero.')
        }

        parentPathObj[childPath] = routeRightsLevel

        // set byRights array
        if (  !Array.isArray( D.get(global, 'accessRights.byRights.' + routeRightsLevel) )  ) {
            D.set(global, 'accessRights.byRights.' + routeRightsLevel, [ parentPath + childPath ])
        } else {
            global.accessRights.byRights[routeRightsLevel].push(parentPath + childPath)
        }
        return _checkAuthentication(routeRightsLevel)
    }

}


function _checkAuthentication(routeRightsLevel) {

    return (req, res, next) => {
        // including routes with rights required of 0
        if(!routeRightsLevel) return next()

        // rights level required is more than 0
        if (req) {
            if (req.headers) { debug(JSON.stringify(req.headers)); }
            else {
                debug('request has no headers!')
                res.status(401).send({ success: false })
            }
        }

        if (!req.isAuthenticated()) return res.status(401).send({ success: false })

        if(routeRightsLevel > req.user.rightsLevel) return res.status(403).send({ success: false })

        return next();
    }

}

module.exports = permit
