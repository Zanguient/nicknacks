var databaseUrl = process.env.DB_URL;
var logging = process.env.DB_LOGGING ? console.log : false;
var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');

var cls = require('continuation-local-storage');
const namespace = cls.createNamespace('sequelizeTransactionNameSpace')
Sequelize.cls = namespace

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
//db.WunderlistTask.sync();
//db.Token.sync({force: true});
sequelize.sync();


db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.databaseUrl = databaseUrl;

module.exports = db;
