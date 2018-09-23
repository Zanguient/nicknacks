const crypto = require('crypto');
const encryptor = require(__appsDir + '/passport/encryptor');
const forgetPasswordMailer = require(__appsDir + '/passport/forgetPasswordMailer.js');

function User(sequelize, DataTypes) {

    var User = sequelize.define('User', {
        userID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 30]
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            isUnique: true,
            validate: {
                isEmail: true
            },
            roles: {
                self: true,
                admin: true
            }
        },
        /* PASSWORD */
        password: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [6, 999999]
            },
            roles: {root: true}
        },
        passwordResetToken: {
            type: DataTypes.STRING,
            roles: {self: true}
        },
        passwordResetTokenExpire: {
            type: DataTypes.DATE,
            roles: {root: true}
        },
        salt: {
            type: DataTypes.STRING,
            allowNull: true,
            roles: {root: true}
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        },
        rightsLevel: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                max: 10,
                min: 0
            },
            roles: {
                self: true,
                admin: true
            }
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: false,
            roles: {
                self: true
            }
        },
        status: {
            type: DataTypes.ENUM,
            allowNull: false,
            values: ['pending', 'suspended', 'active'],
            roles: {
                self: true,
                admin: true
            }
        }
    }, {
        timestamps: true,
        paranoid: true,
        tableName: 'User',
        instanceMethods: {
            generatePasswordResetToken: function () {
                this.passwordResetToken = crypto.randomBytes(16).toString('hex');
                this.passwordResetTokenExpire = MOMENT().add(12, 'hours').format(); //add .format()?
                return this;
            },
            authenticate: function (password) {
                return encryptor.compareHash(password, this.get({role: 'root'}).salt, this.get({role: 'root'}).password) && (this.get({role: 'self'}).status === 'active');
            },
            setPassword: function (password) {
                var generator = encryptor.generateHash(password);
                this.password = generator.hash;
                this.salt = generator.salt;
                return this;
            },
            clearResetToken: function () {
                this.passwordResetToken = null;
                this.passwordResetTokenExpire = null;
                return this;
            },
            deliverForgetPasswordMail: function () {
                return forgetPasswordMailer(this);
            }
        },
        getterMethods: {},
        classMethods: {
            associate: function (models) {}
        }
    });
    return User;
};

module.exports = User;
