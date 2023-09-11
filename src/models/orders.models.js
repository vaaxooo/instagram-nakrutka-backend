const { Model, DataTypes } = require('sequelize')
const { MySQL } = require('../../utils/MySQL')

const Services = require('./services.models')

class Orders extends Model {}

Orders.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    service_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    order_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    link: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    additional_field: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    profit: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    start_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    remains: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('In progress', 'Completed', 'Canceled'),
        allowNull: false,
        defaultValue: 'In progress',
    },
    
}, {
    sequelize: MySQL,
    modelName: 'orders',
    freezeTableName: true,
    timestamps: true,
    indexes: [{ fields: ['status', 'user_id', 'service_id', 'order_id'] }],
})

Orders.belongsTo(Services, { foreignKey: 'service_id', as: 'service' })

module.exports = Orders