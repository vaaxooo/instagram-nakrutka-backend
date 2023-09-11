const restana = require('restana')()
const service = restana.newRouter()
const auth = require('../middlewares/auth.middlewares')

const { login, register, me, refreshToken, changePassword } = require('../services/account.services')
const { getOrdersList, createOrder, cancelOrder } = require('../services/order.services')
const { createDeposit, getDepositsList, getDeposit, getExchangeRates } = require('../services/deposit.services')
const { getReferrals } = require('../services/referral.services')
const { getWithdrawalsList, createWithdrawal } = require('../services/withdrawal.services')

service.get('/test', async(req, res) => { res.send({ success: true }) })

// account routes
service.post('/account/login', login)
service.post('/account/register', register)
service.post('/account/me', auth, me)
service.post('/account/refresh-token', auth, refreshToken)
service.post('/account/change-password', auth, changePassword)

// service routes
// service.get('/services', services)

// order routes
service.post('/orders', auth, createOrder)
service.post('/orders/cancel', auth, cancelOrder)
service.get('/orders', auth, getOrdersList)

// deposit routes
service.get('/deposits', auth, getDepositsList)
service.post('/deposits', auth, createDeposit)
service.get('/deposits/:hash', auth, getDeposit)
service.get('/get-exchange-rates', auth, getExchangeRates)

// referral routes
service.get('/referrals', auth, getReferrals)

// withdrawals routes
service.get('/withdrawals', auth, getWithdrawalsList)
service.post('/withdrawals', auth, createWithdrawal)

module.exports = service