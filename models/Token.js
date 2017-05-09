function Token(sequelize, DataTypes) {

    var Token = sequelize.define('Token', {
        TokenID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        data: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        timestamps: true,
        tableName: 'Token',
        instanceMethods: {},
        getterMethods: {},
        classMethods: {}
    });
    return Token;
}

module.exports = Token;
