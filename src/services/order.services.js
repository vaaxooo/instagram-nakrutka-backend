const axios = require('axios')
const Logger = require('../../utils/logger')
const Validator = require('validatorjs')
const Sequelize = require('sequelize')

const Services = require('../models/services.models')
const Orders = require('../models/orders.models')
const Users = require('../models/users.models')
const Referrals = require('../models/referrals.models')

module.exports = {

    /* The `getOrdersList` function is an asynchronous function that retrieves a list of orders for a
    specific user. It uses the `Orders` model to query the database and find all orders where the
    `user_id` matches the `req.user.id`. The orders are then ordered in descending order based on their
    `id`. Finally, the function sends a response with the retrieved orders as the data. If there is an
    error during the process, it logs the error and sends a response with a message indicating an
    internal server error. */
    getOrdersList: async (req, res) => {
        try {
            const orders = await Orders.findAll({ 
                where: { user_id: req.user.id }, 
                order: [['id', 'DESC']],
                attributes: { exclude: ['user_id', 'service_id', 'profit'] },
                include: [{ model: Services, as: 'service' }]
            })
            return res.send({ success: true, data: orders })    
        } catch (error) {
            Logger.error(error)
            return res.send({ success: false, message: 'Internal server error' })
        }
    },

    /* The `createOrder` function is an asynchronous function that handles the creation of an order. It
    takes in two parameters, `req` and `res`, which represent the request and response objects
    respectively. */
    createOrder: async (req, res) => {
        try {
            const validator = new Validator(req.body, {
                service_id: 'required|integer',
                additional_field: 'string',
                link: 'required|string',
                quantity: 'required|integer'
            })
            if (validator.fails()) {
                return res.send({ success: false, errors: validator.errors.all() })
            }
            const { service_id, additional_field, link, quantity } = req.body
            const service = await Services.findOne({ where: { service_id: service_id } })
            if (!service) {
                return res.send({ success: false, message: 'Service not found' })
            }
            if (service.min > quantity) {
                return res.send({ success: false, message: 'Quantity is too low' })
            }
            if (service.max < quantity) {
                return res.send({ success: false, message: 'Quantity is too high' })
            }
            let cost = service.dirty_rate * quantity / 1000
            if(req.user.balance < cost) {
                return res.send({ success: false, message: 'Balance is too low' })
            }

            const { data: networkBalance } = await axios.get(process.env.NAKRUTKA_API_URL + '?key=' + process.env.NAKRUTKA_API_KEY + '&action=balance')
            if(!networkBalance.balance || networkBalance.balance < cost) {
                return res.send({ success: false, message: 'Network balance is too low' })
            }


            let linkNetwork = process.env.NAKRUTKA_API_URL + '?key=' + process.env.NAKRUTKA_API_KEY + '&action=create&service=' + service.service_id + '&link=' + link + '&quantity=' + quantity
            if(additional_field) {
                linkNetwork += '&comments=' + additional_field
            }

            let { data: responseNetwork } = await axios.get(linkNetwork)
            if(responseNetwork.Error) {
                return res.send({ success: false, message: responseNetwork.Error })
            }


            await Users.update({ balance: Sequelize.literal('balance - ' + cost) }, { where: { id: req.user.id } })

            let profit = cost - (service.clear_rate * quantity / 1000)
            let referral = await Referrals.findOne({ where: { referral_id: req.user.id } })
            if(referral) {
                let referralProfit = +profit * 10 / 100
                profit = +profit - +referralProfit
                await Users.update({ referral_balance: +req.user.referral_balance + +referralProfit }, { where: { id: referral.user_id } })
            }

            const order = await Orders.create({
                user_id: req.user.id,
                service_id: service.service_id,
                order_id: responseNetwork.order,
                additional_field,
                link,
                quantity,
                cost: cost,
                profit: profit,
            })
            return res.send({ success: true, message: 'Order created', data: order })
        } catch (error) {
            Logger.error(error)
            res.send({ success: false, message: 'Internal server error' })
        }
    },

    /* The `cancelOrder` function is an asynchronous function that handles the cancellation of an order. It
    takes in two parameters, `req` and `res`, which represent the request and response objects
    respectively. */
    cancelOrder: async (req, res) => {
        try {
            const validator = new Validator(req.body, {
                order_id: 'required|integer'
            })
            if (validator.fails()) {
                return res.send({ success: false, message: validator.errors.all() })
            }
            const { order_id } = req.body
            const order = await Orders.findOne({ where: { id: order_id } })
            if (!order) {
                return res.send({ success: false, message: 'Order not found' })
            }
            if (order.status !== 'In progress') {
                return res.send({ success: false, message: 'Order is not in progress' })
            }
            let service = await Services.findOne({ where: { service_id: order.service_id } })
            if (!service) {
                return res.send({ success: false, message: 'Service not found' })
            }
            if(!service.cancel) {
                return res.send({ success: false, message: 'Service cannot be cancelled' })
            }
            let responseNetwork = (await axios.get(process.env.NAKRUTKA_API_URL + '?key=' + process.env.NAKRUTKA_API_KEY + '&action=status&orders=' + order.order_id)).data
            if(responseNetwork.Error) {
                return res.send({ success: false, message: responseNetwork.Error })
            }
            let network = responseNetwork[order.order_id]
            if(!network) {
                return res.send({ success: false, message: 'Network error' })
            }
            if(network.status !== 'In progress') {
                return res.send({ success: false, message: 'Order is not in progress' })
            }
            network = (await axios.get(process.env.NAKRUTKA_API_URL + '?key=' + process.env.NAKRUTKA_API_KEY + '&action=cancel&order=' + order.order_id)).data
            if(network.Error || !network.success) {
                return res.send({ success: false, message: 'You cannot cancel this order.' })
            }

            let must_return_balance = +order.cost - (+service.dirty_rate * +order.remains / 1000)
            let new_profit = +network.charge * 3 / 100 

            await Users.update({ balance: +req.user.balance + +must_return_balance }, { where: { id: req.user.id } })
            await Orders.update({ profit: new_profit, status: 'Cancelled' }, { where: { id: order.id } })

            return res.send({ success: true, message: 'Order cancelled', data: order })
        } catch (error) {
            Logger.error(error)
            res.send({ success: false, message: 'Internal server error' })
        }
    }

}