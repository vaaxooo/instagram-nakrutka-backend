const { Model, DataTypes } = require('sequelize')
const { MySQL } = require('../../utils/MySQL')

class Services extends Model {}

Services.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    service_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    refill: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    clear_rate: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    dirty_rate: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    min: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
    },
    max: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1000,
    },
    cancel: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
}, {
    sequelize: MySQL,
    modelName: 'services',
    freezeTableName: true,
    timestamps: false,
    indexes: [{ fields: ['service_id', 'category_id'] }],
})

module.exports = Services