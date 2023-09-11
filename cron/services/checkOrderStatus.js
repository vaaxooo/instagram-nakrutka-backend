const axios = require('axios')
const Orders = require('../../src/models/orders.models')
const Logger = require('../../utils/Logger')

const checkOrderStatus = async() => {
    try {
        let orders = await Orders.findAll({ status: 'In progress' })
        if(!orders) return;
        orders.forEach(async order => {
            const { data: res } = await axios.get(process.env.NAKRUTKA_API_URL + '?key=' + process.env.NAKRUTKA_API_KEY + '&action=status&orders=' + order.order_id)
            if(res.Error) {
                Logger.error(res.Error)
                return;
            }
            let networkOrder = res[order.order_id]
            if(!networkOrder) {
                Logger.error('Network error')
                return;
            }
            await Orders.update({ status: networkOrder.status, start_count: networkOrder.start_count, remains: networkOrder.remains }, { where: { id: order.id } })  
        })
        Logger.info('Cron job checkOrderStatus is finished')
    } catch (err) {
        Logger.error(err);
    }
}

module.exports = checkOrderStatus;