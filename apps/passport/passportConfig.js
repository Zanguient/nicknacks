'use strict';

var LocalStrategy = require('passport-local').Strategy;
var request = require('request');
var encryptor = require('./encryptor');
var debug = require('debug')('nn:apps:passport:passportConfig')
debug.log = console.log.bind(console)

var validator = require('validator');
var randomstring = require("randomstring");

// expose this function to our app using module.exports
function Passport(passport) {


    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    //used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        debug('Serialising user.');

        // add last login date
        done(null, user.userID);

        user.lastLogin = (new Date())
        return user.save().catch((error) => {
            console.error('CRITICAL: Error saving user last login for ' + user.name + '.')
            console.error(error)
        })

    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        debug('Deserialising user.');
        DB.User.findById(id).then(function (user) {
            done(null, user.get({role: 'self'}))
            return null
        }).catch(function (err) {
            done(err, null)
            return null
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================

    // passport.use('local-signup', new LocalStrategy({
    //     // by default, local strategy uses username and password, we will override with email
    //     usernameField: 'email',
    //     passwordField: 'password',
    //     passReqToCallback: true // allows us to pass back the entire request to the callback
    // }, function (req, email, password, done) {
    //
    //     debug('Local signup.');
    //
    //     var email = req.body.email.toLowerCase();
    //     var businessName = req.body.businessName;
    //     var name = req.body.name;
    //     var about = req.body.about;
    //     var password = req.body.password;
    //     var phone = req.body.phone;
    //     var generator = encrypter.generateHash(password);
    //     var userType = req.body.userType;
    //
    //
    //     // password >= 5 characters.
    //     if (typeof password !== 'string' || password.length < 5) {
    //         return done({
    //             statusCode: 400,
    //             message: 'Password must be at least 6 characters.'
    //         }, null);
    //     }
    //
    //     // check for userType
    //     if (typeof userType !== 'string') {
    //         return done({
    //             statusCode: 400,
    //             message: 'userType needs to be a string.'
    //         }, null);
    //     }
    //     else {
    //         // check if userType has been set
    //         if (userType.length > 0) {
    //             var validUsers = ['admin', 'vendor', 'member'];
    //             // check if valid
    //             if (validUsers.indexOf(userType) == -1) {
    //                 // sent back error if not set properly
    //                 return done({
    //                     hideMessage: true,
    //                     statusCode: 400,
    //                     message: 'userType ' + userType + ' is invalid.'
    //                 }, null);
    //             }
    //
    //         }
    //
    //     }
    //
    //     var verificationToken = randomstring.generate({
    //         length: 64
    //     });
    //
    //
    //     DB.User.findOrCreate({
    //         where: {
    //             loginType: 'email',
    //             email: email
    //         },
    //         defaults: {
    //             password: generator.hash,
    //             salt: generator.salt,
    //             phone: phone,
    //             businessName: businessName,
    //             name: name,
    //             about: about,
    //             userType: userType,
    //             verificationToken: verificationToken,
    //             status: 'pending'
    //         }
    //     }).spread(function (user, created) {
    //
    //         if (!created) {
    //             debug('Email already exist.');
    //             return done({
    //                 statusCode: 400,
    //                 message: 'Email already exists.'
    //             }, null);
    //         }
    //
    //         var promises = [];
    //
    //         // push the user data
    //         promises.push(user);
    //
    //         // check for userType
    //         if (user.get({role: 'self'}).userType === 'vendor') {
    //             // if userType is vendor, create accountSettings
    //             promises.push(DB.AccountSettings.create({
    //                 User_userID_vendor: user.get({role: 'self'}).userID,
    //                 bookingMode: 'instant',
    //                 cancellationPolicy: 'moderate'
    //             }));
    //         }
    //
    //
    //         return PROMISE.all(promises);
    //
    //         // send welcome email
    //         //welcomeMailer(user.get({role: 'admin'}));
    //
    //     })
    //         .spread(function (user, accountSettingsCreated) {
    //
    //             // check for userType
    //             if (user.get({role: 'self'}).userType === 'vendor') {
    //                 // check if account settings have been created
    //                 if (!accountSettingsCreated || Object.keys(accountSettingsCreated).length === 0) {
    //                     //  delete the user
    //                     user.destroy()
    //                         .then(function () {
    //                             // return error
    //                             return done({
    //                                 statusCode: 400,
    //                                 message: 'Account Settings not created.'
    //                             }, null);
    //                         })
    //                 }
    //
    //             }
    //
    //             // reply to the user
    //             done(null, user.get({role: 'self'}));
    //
    //
    //         })
    //         .catch(function (err) {
    //
    //             console.log(err);
    //
    //
    //             err.statusCode = 500;
    //             done(err, false);
    //         });
    //
    //     function _getEmailUsername(email) {
    //         if (typeof email !== 'string') return '';
    //
    //         var i = email.indexOf('@');
    //
    //         if (i === -1) return '';
    //
    //         return email.substring(0, i);
    //     }
    //
    // }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================

    passport.use('local-login', new LocalStrategy({

        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback

    }, function (req, email, password, done) { // callback with email and password from our form

        debug('passport-local-login');
        debug(email);

        //check if email and password are valid strings.
        if (typeof email !== 'string' || typeof password !== 'string') {

            return done({
                statusCode: 401,
                message: 'Email or password is not valid.'
            }, null);

        }

        //basic email check.
        if (!validator.isEmail(email)) {

            // for simplicity we will use 403 also even though 400 is more appropriate.
            return done({
                statusCode: 401,
                message: 'Email is not valid.'
            });

        }

        var email = req.body.email.toLowerCase();
        var password = req.body.password; // just in case password is lost like email

        DB.User.find({
            where: { email }
        }).then(function (user) {

            debug('User found:', user);

            // authentication is unsuccessfull
            // we deliberately do not differentiate between not being
            // unable to find the user or when password is incorrect.
            if (!user || !user.authenticate(req.body.password)) {

                debug('Authentication has failed.');

                return done({
                    statusCode: 401
                }, null);

            }

            // everything is good, returning the user.
            return done(null, user);

        }).catch(function (error) {

            console.error('Local-login: An error has occurred in DB.User.find().')
            console.error(error)

            // set 500 and return it back.
            err.statusCode = 500;
            done(err, false);

        });

    })); // closure: passport.use 'local'


} // closure Passport

module.exports = Passport;
