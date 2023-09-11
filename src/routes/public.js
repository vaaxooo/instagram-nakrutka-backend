const restana = require('restana')()
const service = restana.newRouter()

const { getCategories, getServicesByCategory, getServices } = require('../services/category.services')


service.get('/test', async(req, res) => { res.send({ success: true }) })


// category services
service.get('/categories', getCategories)
service.get('/categories/:category_id/services', getServicesByCategory)
service.get('/services', getServices)

module.exports = service