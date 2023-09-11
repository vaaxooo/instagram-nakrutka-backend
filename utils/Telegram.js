const TelegramApi = require("node-telegram-bot-api");

const Telegram = new TelegramApi(process.env.TELEGRAM_TOKEN, { polling: true, logger: false });


module.exports = Telegram;