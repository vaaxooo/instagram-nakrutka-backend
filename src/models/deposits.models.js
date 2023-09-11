const { Model, DataTypes } = require('sequelize')
const { MySQL } = require('../../utils/MySQL')

class Deposits extends Model {}

Deposits.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    hash: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    payment_method: {
        type: DataTypes.ENUM('debit', 'usdt', 'bitcoin'),
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Success', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending',
    },
    
}, {
    sequelize: MySQL,
    modelName: 'deposits',
    freezeTableName: true,
    timestamps: true,
    indexes: [{ fields: ['status', 'user_id', 'payment_method'] }],
})


module.exports = Deposits