function routerWrapper(expressRouter) {

    if (!global.apiPermissions) global.apiPermissions = {}
    console.log(expressRouter.stack)

    return function () {
        expressRouter
    }
}

module.exports = routerWrapper
