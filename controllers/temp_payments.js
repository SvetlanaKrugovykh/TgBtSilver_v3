
await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
	reply_markup: {
		inline_keyboard: [
			[{ text: 'Сделать заказ', web_app: { url: webAppUrl } }]
		]
	}
})

app.post('/web-data', async (req, res) => {
	const { queryId, products = [], totalPrice } = req.body;
	try {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Успешная покупка',
			input_message_content: {
				message_text: ` Сплачена послуга на суму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
			}
		})
		return res.status(200).json({});
	} catch (e) {
		return res.status(500).json({})
	}
})

