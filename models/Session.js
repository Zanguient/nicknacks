function Session(sequelize, DataTypes) {
    var Session = sequelize.define('Session', {
        sid: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false
        },
        sess: {
            type: DataTypes.JSON,
            allowNull: false
        },
        expire: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        timestamps: false,
        tableName: 'Session'
    });

return Session;
}
module.exports = Session
