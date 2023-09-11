const { Model, DataTypes } = require('sequelize')
const { MySQL } = require('../../utils/MySQL')

class Categiries extends Model {}

Categiries.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    sequelize: MySQL,
    modelName: 'categories',
    freezeTableName: true,
    timestamps: false,
    indexes: [{ fields: ['category_id'] }],
})

module.exports = Categiries