const { Model, DataTypes } = require('sequelize')
const { MySQL } = require('../../utils/MySQL')

class Users extends Model {}

Users.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'user',
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    referral_balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: MySQL,
    modelName: 'users',
    freezeTableName: true,
    timestamps: false,
    uniqueKeys: {
        unique_email: {
            fields: ['email'],
        },
    },
    indexes: [{ fields: ['role'] }],
    defaultScope: {
        attributes: { exclude: ['password'] },
    },
    scopes: {
        withPassword: {
            attributes: {},
        },
    },
})

module.exports = Users