const Logger = require('../../utils/Logger')
const Referrals = require('../models/referrals.models')
const Users = require('../models/users.models')

module.exports = {

    /* The `getReferrals` function is an asynchronous function that handles a request to retrieve the
    number of referrals and the referral balance for a specific user. */
    getReferrals: async(req, res) => {
        try {
            let referrals = await Referrals.count({ where: { user_id: req.user.id } })
            let balance = (await Users.findOne({ where: { id: req.user.id }, attributes: ['referral_balance'] })).referral_balance
            return res.send({ success: true, data: {
                referrals: referrals, balance: balance
            } })
        } catch (err) {
            Logger.error(err)
            return res.send({ success: false, message: 'Internal server error' })
        }
    }

}