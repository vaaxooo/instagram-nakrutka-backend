const { Model, DataTypes } = require('sequelize')
const { MySQL } = require('../../utils/MySQL')

class Referrals extends Model {}

Referrals.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    referral_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    }
}, {
    sequelize: MySQL,
    modelName: 'referrals',
    freezeTableName: true,
    timestamps: true,
    indexes: [{ fields: ['user_id', 'referral_id'] }],
})

module.exports = Referrals