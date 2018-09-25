const express = require('express');
const router = express.Router();
const permit = require(__appsDir + '/passport/permit')('/api/v2/login')
const validator = require('validator')
const _ = require('lodash')

const debug = require('debug')('nn:api:login')
debug.log = console.log.bind(console)

router.post('/', permit('/', 0), (req, res, next) => {

    debug(req.body)

    PASSPORT.authenticate('local-login', function (err, user, info) {

        // error
        if (err) {

            // authentication failed.
            if (err.statusCode && err.statusCode === 401) {

                return res.status(err.statusCode).send({
                    success: false,
                    message: 'Login failed, please try again.'
                })

            } else {
                let error = new Error('Login failed. Please try again.')
                error.debug = err
                return API_ERROR_HANDLER(error, req, res, next)
            }

        }

        // now we serialise the user.
        return req.logIn(user, function (err) {

            if (err) {
                let error = new Error('Login failed. Please try again.')
                error.debug = err
                return API_ERROR_HANDLER(error, req, res, next)
            }

            // user is found and no errors
            // return success with success message
            return res.send({
                success: true,
                user: user
            })

        });


    })(req, res);
});

router.post('/logout', permit('/', 0), (req, res, next) => {

    debug(req.body)

    try {
        req.logout();
    } catch(err) {
        return res.send({success: true })
    }
    return res.send({success: true});

});


router.get('/am-i-authenticated', permit('/am-i-authenticated', 1), (req, res, next) => {

    return res.send({
        success: true,
        user: req.user
    })

})

router.post('/password/forget', permit('/password/forget', 0), (req, res, next) => {

    if (!validator.isEmail(req.body.email)) {
        return res.status(400).send({
            success: false,
            message: 'Please enter an email'
        })
    }

    DB.User.find({
        where: { email: req.body.email.toLowerCase() }
    })
    .then(function(user) {
        if (!user) {
            // if no user found by email, be silent about it!
            debug('User with email: ' + req.body.email + ' was not found.')
            res.send({
                success: true
            })
            return
        }

        return user.generatePasswordResetToken().save().then(user => {

            user.deliverForgetPasswordMail()
            return res.send({ success: true })

        })

    }).catch(function(error){ API_ERROR_HANDLER(error, req, res, next) });

});

router.post('/password/reset', permit('/password/reset', 0), (req, res, next) => {

    DB.User.find({
        where: {
            passwordResetToken: {
                $and: {
                    $eq: req.body.token,
                    $ne: null
                }
            },
            passwordResetTokenExpire: {
                $gt: new Date()
            }
        }
    })
    .then(function(user) {
        if (!user) {
            // if no user found by email, be silent about it!
            debug('User was not found with reset token ' + req.body.token)
            res.status(400).send({
                success: false,
                message: 'Password reset is not successful, please try again or get a new reset email.'
            })
            return
        }

        return user.setPassword(req.body.password).save().then(user => {

            // TODO: reset the password reset tokens

            // now we serialise the user.
            return req.logIn(user, function (err) {

                if (err) return API_ERROR_HANDLER(err, req, res, next)

                if (!user) {

                    return res.status(err.statusCode).send({
                        success: false,
                        message: 'Login failed, please try again.'
                    })
                }

                // user is found and no errors
                // return success with success message
                return res.send({
                    success: true,
                    user: user.get({role: 'self'})
                })

            })

        })

    }).catch(function(error){ API_ERROR_HANDLER(error, req, res, next) });

});

router.get('/access-rights/routes', permit('/access-rights/routes', 10), (req, res, next) => {
    res.send({
        success: true,
        data: global.accessRights
    })
})

module.exports = router;
