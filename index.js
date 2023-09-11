require('dotenv-flow').config();
const restana = require('restana')()
const http = require('http')
const bodyParser = require('body-parser')
const cors = require('cors')

require('./cron/index')

const {MySQL} = require('./utils/MySQL')
const Logger = require('./utils/Logger')
const Telegram = require('./utils/Telegram');

const privateRoutes = require('./src/routes/private')
const publicRoutes = require('./src/routes/public')

restana.use(cors())
restana.use(bodyParser.urlencoded({ extended: false }))
restana.use(bodyParser.json())



restana.use('/api/private', privateRoutes)
restana.use('/api/public', publicRoutes)

const PORT = process.env.PORT || 3000
let server = http.createServer(restana).listen(PORT, async() => {
    try {
        await MySQL.authenticate();
        await MySQL.sync()
        Logger.info('Connection DB has been established successfully.');
    } catch (error) {
        Logger.error('Unable to connect to the database:', error);
    }
    Logger.info(`Server is running on port ${PORT}`)
})

server.on('error', (err) => {
    console.log("START")
    Logger.error(err);
});