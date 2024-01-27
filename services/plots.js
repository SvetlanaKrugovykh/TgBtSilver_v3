
const axios = require('axios')
require('dotenv').config()
const fs = require('fs').promises

const plot = async (bot, msg, period, deviceName) => {
  const URL_LOG = process.env.URL_LOG
  const AUTH_TOKEN = process.env.AUTH_TOKEN

  const response = await axios({
    method: 'post',
    url: URL_LOG,
    responseType: 'json',
    headers: {
      Authorization: `${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: {
      "Query": `ВЫБРАТЬ\n\u0009snmp_mrtg_values.Период AS Period,\n\u0009snmp_mrtg_values.snmp_mrtg.Наименование AS deviceName,\n\u0009snmp_mrtg_values.Delta AS Mbps,\n\u0009snmp_mrtg_values.snmp_mrtg.port AS port\nFROM\n\u0009РегистрСведений.snmp_mrtg_values AS snmp_mrtg_values\nWHERE\n\u0009snmp_mrtg_values.snmp_mrtg.Наименование LIKE \"${deviceName}\"\n\u0009AND snmp_mrtg_values.Период МЕЖДУ НАЧАЛОПЕРИОДА(DATETIME(${period.year}, ${period.month}, ${period.day}), DAY) И КОНЕЦПЕРИОДА(DATETIME(${period.year}, ${period.month}, ${period.day}), DAY)`
    },
  })

  if (!response.status == 200) {
    console.log(response.status)
    return null
  } else {
    console.log('response.status', response.status)
    try {
      const data = response.data.ResponseArray
      await drawChart(bot, msg, data)
    } catch (err) {
      console.log(err)
    }
  }
}


// Функция для выбора каждой n-ой точки из массива данных
function selectEveryNthPoint(data, n) {
  return data.filter((item, index) => index % n === 0)
}

async function drawChart(bot, msg, data) {
  const quickChartAPI = 'https://quickchart.io/chart'

  // Фильтрация данных
  const filteredData = selectEveryNthPoint(data, 10);

  const chartData = {
    type: 'line',
    data: {
      labels: filteredData.map(item => item.Period),
      datasets: [
        {
          label: '192.168.65.239_UP_in',
          data: filteredData.map(item => item.Mbps),
          borderColor: '#ADD8E6',
          fill: false
        },
        {
          label: '192.168.65.239_UP_out',
          data: filteredData.map(item => item.Mbps),
          borderColor: '#90EE90',
          fill: false
        }
      ]
    },
    options: {
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'minute'
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            stepSize: 500000000,
            callback: function (value) {
              return value / 1000000 + ' Mbps'
            }
          }
        }]
      }
    }
  }

  try {
    const response = await axios.post(quickChartAPI, {
      chart: chartData,
      width: 800,
      height: 600
    }, {
      responseType: 'arraybuffer' // Указываем axios, что мы хотим получить массив байтов в ответе
    })

    if (response.status === 200) {
      // Сохраняем изображение во временный файл
      const tempFilePath = 'chart.png'
      await fs.writeFile(tempFilePath, response.data)

      // Отправляем изображение через Telegram Bot API
      await bot.sendPhoto(msg.chat.id, tempFilePath)

      // Удаляем временный файл после отправки
      await fs.unlink(tempFilePath)
    } else {
      console.error('Ошибка при получении изображения графика: Неправильный статус ответа', response.status)
    }
  } catch (error) {
    console.error('Ошибка при получении изображения графика:', error.message)
  }
}

module.exports = { plot }
