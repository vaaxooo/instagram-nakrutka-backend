const Sequelize = require('sequelize')
const Validator = require('validatorjs')
const Logger = require('../../utils/Logger')

const Withdrawals = require('../models/withdrawals.models')
const Users = require('../models/users.models')
const Telegram = require('../../utils/Telegram')

module.exports = {

    /* The `getWithdrawalsList` function is an asynchronous function that retrieves a list of withdrawals
    for a specific user. It uses the `Withdrawals` model to query the database and find all withdrawals
    where the `user_id` matches the `req.user.id`. The withdrawals are then ordered in descending order
    based on their `id`. Finally, the function sends a response with the retrieved withdrawals as the
    data. If there is an error during the process, it logs the error and sends a response with a message
    indicating an internal server error. */
    getWithdrawalsList: async (req, res) => {
        try {
            const withdrawals = await Withdrawals.findAll({ 
                where: { user_id: req.user.id }, 
                order: [['id', 'DESC']],
                attributes: { exclude: ['user_id'] },
            })
            return res.send({ success: true, data: withdrawals })    
        } catch (error) {
            Logger.error(error)
            return res.send({ success: false, message: 'Internal server error' })
        }
    },

    /* The `createWithdrawal` function is an asynchronous function that handles the creation of a
    withdrawal. It takes in two parameters, `req` and `res`, which represent the request and response
    objects respectively. */
    createWithdrawal: async (req, res) => {
        try {
            const validator = new Validator(req.body, {
                amount: 'required|numeric',
                payment_method: 'required|string',
                wallet: 'string'
            })
            if (validator.fails()) {
                return res.send({ success: false, errors: validator.errors.all() })
            }

            const { amount, payment_method, wallet } = req.body
            if((payment_method === 'debit' || payment_method === 'usdt') && !wallet) {
                return res.send({ success: false, message: 'Wallet address is required' })
            }

            if (+req.user.referral_balance < +amount) {
                return res.send({ success: false, message: 'Insufficient balance' })
            }

            if(payment_method === 'debit' || payment_method === 'usdt') {
                const withdrawal = await Withdrawals.create({
                    user_id: req.user.id,
                    amount: amount,
                    payment_method: payment_method,
                    wallet: wallet
                })
                await Users.update({ referral_balance: +req.user.referral_balance - +amount }, { where: { id: req.user.id } })
                return res.send({ success: true, message: 'Withdrawal created successfully', data: withdrawal })
            }

            const withdrawal = await Withdrawals.create({
                user_id: req.user.id,
                amount: amount,
                payment_method: payment_method,
                wallet: wallet,
                status: 'Success'
            })

            let message = `Create withdrawal request\n\n`
            message += `User: ${req.user.email} (#${req.user.id})\n`;
            message += `Amount: ${amount} $\n`;
            message += `Payment method: ${payment_method}\n`;
            message += `Wallet: ${wallet}\n`
            Telegram.sendMessage(process.env.TELEGRAM_CHAT_ID, message)


            await Users.update({ balance: +req.user.balance + +amount, referral_balance: +req.user.referral_balance - +amount }, { where: { id: req.user.id } })
            return res.send({ success: true, message: 'Withdrawal created successfully', data: withdrawal })

        } catch (error) {
            Logger.error(error)
            return res.send({ success: false, message: 'Internal server error' })
        }
    }

}