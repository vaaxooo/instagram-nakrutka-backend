const Logger = require('../../utils/Logger')
const Categories = require('../models/categories.models')
const Services = require('../models/services.models')

module.exports = {

    /* The `getCategories` function is an asynchronous function that handles the logic for retrieving
    categories from the database. */
    getCategories: async(req, res) => {
        try {
            const categories = await Categories.findAll()
            res.send({ success: true, data: categories })
        } catch (error) {
            Logger.error(error)
            res.send({ success: false, message: 'Internal server error!' }, 500)
        }
    },


    /* The `getServicesByCategory` function is an asynchronous function that handles the logic for
    retrieving services from the database based on a specific category. */
    getServicesByCategory: async(req, res) => {
        try {
            if(!req.params.category_id) {
                return res.send({ success: false, message: 'Category ID is required!' }, 400)
            }
            const { category_id } = req.params
            const services = await Services.findAll({ where: { category_id } })
            res.send({ success: true, data: services }, 200)
        } catch (error) {
            Logger.error(error)
            res.send({ success: false, message: 'Internal server error!' }, 500)
        }
    },


    /* The `getServices` function is an asynchronous function that handles the logic for retrieving all
    services from the database. */
    getServices: async(req, res) => {
        try {
            const services = await Services.findAll()
            res.send({ success: true, data: services })
        } catch (error) {
            Logger.error(error)
            res.send({ success: false, message: 'Internal server error!' }, 500)
        }
    }

}