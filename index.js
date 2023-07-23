const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const { guestStartButtons, adminStartButtons, authStartButtons } = require('./modules/keyboard');
const { users } = require('./users/users.model');
const { handler, guestMenu, userMenu, adminMenu } = require('./controllers/switcher');
const sendReqToDB = require('./modules/tlg_to_DB');
const singUpDataSave = require('./controllers/signUp').singUpDataSave;
const formController = require('./controllers/formController')

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = 'https://' + process.env.WEB_APP_URL;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {

  const chatId = msg.chat.id;
  const text = msg.text;
  const ctx = msg;

  if (text === '/start') {
    console.log(new Date());
    console.log(ctx.chat);
    const adminUser = users.find(user => user.id === ctx.chat.id);
    if (!adminUser) {
      try {
        const response = await sendReqToDB('__CheckTlgClient__', ctx.chat, '');
        if (response.includes("authorized")) {
          await userMenu(bot, msg, authStartButtons);
        } else {
          await guestMenu(bot, msg, guestStartButtons);
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        await adminMenu(bot, msg, adminStartButtons);
      } catch (err) {
        console.log(err);
      }
    }
  } else {
    await handler(bot, msg, webAppUrl);
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data)
      console.log(data)
      await bot.sendMessage(chatId, 'Дякуємо за зворотній зв`язок!')
      await bot.sendMessage(chatId, 'Ваш emal: ' + data?.email);
      await bot.sendMessage(chatId, 'Ваш договір: ' + data?.contract);
      await bot.sendMessage(chatId, 'Всю необхідну інформацію Ви можете отримувати в цьому чаті. Якщо у Вас виникли питання, звертайтесь через меню /"Надіслати повідомлення/". Зараз для переходу в головне меню натисніть /start');
      await singUpDataSave(bot, chatId, data);
      return;
    } catch (e) {
      console.log(e);
    }
  }

});

app.post('/submit-form', formController.handleFormSubmit)

const PORT = 8000;
app.listen(PORT, () => console.log('server started on PORT ' + PORT))

