//load environment variables
require('dotenv').load();

var databaseUrl = process.env.DB_URL;
var logging = process.env.DB_LOGGING ? console.log : false;

var cls = require('continuation-local-storage');
var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');

Sequelize.cls = cls.createNamespace('sequelizeTransactionNameSpace');

require('sequelize-isunique-validator')(Sequelize);

var sequelize = new Sequelize(databaseUrl, {logging: logging});

// Test and log connection to the database
sequelize
    .authenticate()
    .then(function (err) {
        console.log('Connection has been established successfully.');
    })
    .catch(function (err) {
        console.log('Unable to connect to the database:', err);
    });

var db = {};

fs.readdirSync(__dirname).filter(function (file) {
    return (file.indexOf('.') !== 0) && (file.indexOf('.') !== -1) && (file !== 'index.js')
}).forEach(function (file) {
    var model = sequelize.import(path.join(__dirname, file));
    var name = model.name;
    db[name] = model;
});

Object.keys(db).forEach(function (modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db)
    }
});

//call db.[Model].sync() to sync only one model.
//db.PriceRule.sync({force:true});
//db.PriceRulePriceHour.sync({force:true});
//db.BoatAttribute.sync({force:true});
//db.Boat.sync({force:true});
//db.Attribute.sync({force:true});
//db.Order.sync({force: true});
//db.AccountSettings.sync({force: true});
/*db.SiteSettings.sync({force: true})
 .then(function () {
 // Table created
 return db.SiteSettings.bulkCreate([{
 name: 'siteTitle',
 value: 'Waterspot',
 type: 'text'
 },
 {
 name: 'siteDescription',
 value: 'Singapore’s first one-stop booking platform for water activities. Fast and Easy Bookings · Competitively Priced · Discounts · Wide Range of Water Activities!',
 type: 'text'
 }]);
 });
 */
//db.Booking.drop();
//db.Content.sync({force: true});
//db.Card.sync({force: true});
//db.Coupon.sync({force: true});
//db.CalendarDay.sync({force: true});
//sequelize.sync();


db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.databaseUrl = databaseUrl;

module.exports = db;
