const axios = require('axios');
const Logger = require('../../utils/Logger')
const Validator = require('validatorjs');
const Deposits = require('../models/deposits.models');
const Telegram = require('../../utils/Telegram');

module.exports = {

    async getDepositsList(req, res) {
        try {
            const deposits = await Deposits.findAll({ where: { user_id: req.user.id } });
            return res.send({ success: true, message: 'Deposits list', data: deposits });
        } catch (error) {
            Logger.error(error);
            return res.send({ success: false, message: 'Error getting deposits list' });
        }
    },

    /**
     * This function creates a deposit record in the database with the provided amount and payment method,
     * and associates it with the user making the request.
     * @param req - The req parameter is the request object that contains information about the incoming
     * HTTP request, such as the request headers, request body, and request parameters.
     * @param res - The `res` parameter is the response object that is used to send the response back to
     * the client. It contains methods and properties that allow you to control the response, such as
     * `send`, `json`, `status`, etc. In this code snippet, the `send` method is used to
     * @returns a response object. If the validation fails, it returns an object with success set to false,
     * a message indicating invalid deposit data, and the validation errors. If the validation passes, it
     * creates a deposit object and returns an object with success set to true, a message indicating
     * successful deposit creation, and the deposit data. If an error occurs during the process, it returns
     * an object with
     */
    async createDeposit(req, res) {
        try {
            const validator = new Validator(req.body, {
                amount: 'required|numeric',
                payment_method: 'required|string',
            });
            if (validator.fails()) {
                return res.send({ success: false, message: 'Invalid deposit data', errors: validator.errors.all() });
            }

            const { amount, payment_method } = req.body;
            if(+amount < 5) {
                return res.send({ success: false, message: 'Minimum deposit amount is 5 $' });
            }
            const deposit = await Deposits.create({
                amount,
                payment_method,
                user_id: req.user.id,
            });

            let message = `New deposit request\n\n`;	
            message += `User: ${req.user.email} (#${req.user.id})\n`;
            message += `Amount: ${amount} $\n`;
            message += `Payment method: ${payment_method}\n`;
            message += `Hash: ${deposit.hash}\n`;
            message += `Date: ${deposit.createdAt}\n`;
            Telegram.sendMessage(process.env.TELEGRAM_CHAT_ID, message);

            return res.send({ success: true, message: 'Deposit created successfully', data: deposit });
        } catch (error) {
            Logger.error(error);
            return res.send({ success: false, message: 'Internal server error'});
        }
    },

    /**
     * The function `getDeposit` retrieves a deposit record from the database based on the provided ID and
     * the authenticated user's ID.
     * @param req - The `req` parameter is the request object that contains information about the incoming
     * HTTP request, such as the request headers, request parameters, request body, etc. It is used to
     * retrieve data from the client and pass it to the server.
     * @param res - The `res` parameter is the response object that is used to send the response back to
     * the client. It contains methods and properties that allow you to control the response, such as
     * `send`, `json`, `status`, etc. In this code snippet, the `res` object is used to
     * @returns a response object with the following properties:
     * - success: a boolean value indicating whether the deposit was found or not
     * - message: a string message providing information about the result of the operation
     * - data: the deposit object if it was found, otherwise it will be undefined
     */
    async getDeposit(req, res) {
        try {
            const { hash } = req.params;
            const deposit = await Deposits.findOne({ where: { hash, user_id: req.user.id } });
            if (!deposit) {
                return res.send({ success: false, message: 'Deposit not found' });
            }
            return res.send({ success: true, message: 'Deposit found', data: deposit });
        } catch (error) {
            Logger.error(error);
            return res.send({ success: false, message: 'Internal server error'});
        }
    },


    /**
     * The function `getExchangeRates` makes an asynchronous HTTP GET request to the Binance API to
     * retrieve the current exchange rate for BTC to USDT and returns the response.
     * @param req - The `req` parameter is the request object that contains information about the incoming
     * HTTP request, such as headers, query parameters, and request body. It is used to retrieve
     * information from the client and pass it to the server.
     * @param res - The `res` parameter is the response object that will be sent back to the client. It is
     * used to send the response data or error message back to the client.
     * @returns a response object. If the API call is successful, it will return a response with a success
     * status, a message indicating the exchange rates, and the data containing the exchange rates. If
     * there is an error, it will return a response with a success status of false and a message indicating
     * the error.
     */
    async getExchangeRates(req, res) {
        try {
            const { data: data } = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
            return res.send({ success: true, message: 'Exchange rates', data: data });
        } catch (error) {
            console.log(error);
            Logger.error(error);
            return res.send({ success: false, message: 'Error getting exchange rates' });
        }
    }

}