const { Model, DataTypes } = require('sequelize')
const { MySQL } = require('../../utils/MySQL')

class Withdrawals extends Model {}

Withdrawals.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    wallet: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('In progress', 'Success', 'Cancelled'),
        defaultValue: 'In progress',
    }
}, {
    sequelize: MySQL,
    modelName: 'withdrawals',
    freezeTableName: true,
    timestamps: true,
    indexes: [{ fields: ['user_id', 'payment_method', 'status'] }],
})

module.exports = Withdrawals