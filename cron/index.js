const cron = require('node-cron');
const Logger = require('../utils/Logger');
const {
    checkOrderStatus,
} = require('./services');


cron.schedule('*/1 * * * *', checkOrderStatus);

Logger.info('Cron jobs started');