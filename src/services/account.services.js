const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Logger = require('../../utils/Logger')
const Validator = require('validatorjs')

const Users = require('../models/users.models')
const Referrals = require('../models/referrals.models')

module.exports = {

    /* This is a function called `Login` that handles the login process for a user. It takes in two
    parameters, `req` and `res`, which represent the request and response objects respectively. */
    login: async(req, res) => {
        try {
            let validator = new Validator(req.body, {
                email: 'required|email',
                password: 'required'
            })
            if (validator.fails()) {
                return res.send({ success: false, errors: validator.errors.all() })
            }
            let user = await Users.scope('withPassword').findOne({ where: { email: req.body.email } })
            if (!user) {
                return res.send({ success: false, message: 'Incorrect email address or password' })
            }
            let passwordMatch = await bcrypt.compare(req.body.password, user.password)
            if (!passwordMatch) {
                return res.send({ success: false, message: 'Incorrect email address or password' })
            }
            let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' })
            return res.send({ success: true, token: token, user: { email: user.email, role: user.role, balance: user.balance } })
        } catch (error) {
            Logger.error(error)
            return res.send({ success: false, message: 'Internal server error' })
        }
    },


    /* The `register` function is responsible for handling the registration process for a user. It takes in
    two parameters, `req` and `res`, which represent the request and response objects respectively. */
    register: async(req, res) => {
        try {
            let validator = new Validator(req.body, {
                email: 'required|email',
                password: 'required|min:8',
                confirmPassword: 'required|min:8'
            })

            // return res.send({ ref: req.body.ref })

            if (validator.fails()) {
                return res.send({ success: false, errors: validator.errors.all() })
            }
            if (req.body.password !== req.body.confirmPassword) {
                return res.send({ success: false, message: 'Passwords do not match' })
            }
            let user = await Users.findOne({ where: { email: req.body.email } })
            if (user) {
                return res.send({ success: false, message: 'Email address already in use' })
            }
            let hashedPassword = await bcrypt.hash(req.body.password, 10)
            const newUser = await Users.create({ email: req.body.email, password: hashedPassword })
            
            if(req.body.ref) {
                let referral = (req.body.ref)
                let referrer = await Users.findOne({ where: { id: referral } })
                if(referrer) {
                    await Referrals.create({
                        user_id: referral,
                        referral_id: newUser.id
                    })
                }
                console.log(referral, referrer, newUser.id)
            }

            return res.send({ success: true, message: 'Account created' })
        } catch (error) {
            Logger.error(error)
            return res.send({ success: false, message: 'Internal server error' })
        }
    },


    /* This is a function called `me` that retrieves the user information for the currently
    authenticated user. It takes in two parameters, `req` and `res`, which represent the request and
    response objects respectively. */
    me: async(req, res) => {
        try {
            let user = await Users.findOne({ where: { id: req.user.id } })
            return res.send({ success: true, user })
        } catch (error) {
            Logger.error(error)
            return res.send({ success: false, message: 'Internal server error' })
        }
    },


    /* This is a function called `refreshToken` that generates a new JWT token for the currently
    authenticated user and sends it back in the response along with the user information. It takes
    in two parameters, `req` and `res`, which represent the request and response objects
    respectively. The function first generates a new token using the `jwt.sign` method, passing in
    the user ID and a secret key. It then retrieves the user information from the database using the
    `Users.findOne` method and sends back a response with the new token, a success message, and the
    user information. If there is an error, it logs the error and sends back a response with a
    failure message. */
    refreshToken: async(req, res) => {
        try {
            const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1d' })
            const user = await Users.findOne({ where: { id: req.user.id } })
            return res.send({
                success: true,
                message: 'Token refreshed',
                token: token,
                user: user
            })
        } catch (error) {
            Logger.error(error)
            return res.send({ success: false, message: 'Internal server error' })
        }
    },


    /* The `changePassword` function is responsible for handling the process of changing a user's password. */
    changePassword: async(req, res) => {
        try {
            let validator = new Validator(req.body, {
                current_password: 'required',
                new_password: 'required|min:8',
                confirm_password: 'required|min:8'
            })
            if (validator.fails()) {
                return res.send({ success: false, errors: validator.errors.all() })
            }
            if (req.body.new_password !== req.body.confirm_password) {
                return res.send({ success: false, message: 'Passwords do not match' })
            }
            let user = await Users.scope('withPassword').findOne({ where: { id: req.user.id } })
            let passwordMatch = await bcrypt.compare(req.body.current_password, user.password)
            if (!passwordMatch) {
                return res.send({ success: false, message: 'Incorrect current password' })
            }
            let hashedPassword = await bcrypt.hash(req.body.new_password, 10)
            await Users.update({ password: hashedPassword }, { where: { id: req.user.id } })
            return res.send({ success: true, message: 'Password changed' })
        } catch(error) {
            Logger.error(error)
            return res.send({ success: false, message: 'Internal server error' })
        }
    }

}