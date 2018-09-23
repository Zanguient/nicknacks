const debug = require('debug')('nn:apps:passport:forgetPasswordMailer')
debug.log = console.log.bind(console)

if (!SGMAIL) {
    let sgMail = global.SGMAIL = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}


module.exports = function send(user) {

    let resetUrl = process.env.DOMAIN
    resetUrl += '/admin_' + process.env.ADMIN_URL_SUFFIX
    resetUrl += '/login/forget-password-reset'
    resetUrl += '/' + user.get({role: 'self'}).passwordResetToken

    var html  = '<h3>Hi there!</h3>';
        html += '<p>You have requested for a password reset. In order to reset your password please follow this <a href="' + resetUrl + '">link</a>.</p>';
        html += '<p>You have 12 hours before the request expires. If you did not request for the change, please ignore this mail.</p>';

    SGMAIL.send({
      to:       user.get({role: 'self'}).email,
      from:     'calvin@greyandsanders.com',
      fromname: 'Calvin Wilton Tan',
      subject:  'Nicknacks password reset',
      html:     html
    }, function(err, json){
      if (err) {
          console.error('Error in sending out forget password mail.')
          console.error(err.stack);
      }
      return json;
    });

}
