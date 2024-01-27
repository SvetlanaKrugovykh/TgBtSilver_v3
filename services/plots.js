
const { ChartJSNodeCanvas } = require('chartjs-node-canvas')
const axios = require('axios')
require('dotenv').config()

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


async function drawChart(bot, msg, data) {
  const filteredDataIn = data.filter(item => item.deviceName === '192.168.65.239_UP_in')
  const filteredDataOut = data.filter(item => item.deviceName === '192.168.65.239_UP_out')

  const chartDataIn = filteredDataIn.map(item => item.Mbps)
  const chartDataOut = filteredDataOut.map(item => item.Mbps)
  const chartLabels = filteredDataIn.map(item => item.Period)

  const chartTitleIn = '192.168.65.239_UP_in'
  const chartTitleOut = '192.168.65.239_UP_out'

  const chartConfig = {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: chartTitleIn,
          data: chartDataIn,
          borderColor: '#ADD8E6',
          fill: false
        },
        {
          label: chartTitleOut,
          data: chartDataOut,
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

  const width = 800 //px
  const height = 600 //px
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height })
  const chartImageBuffer = await chartJSNodeCanvas.renderToBuffer(chartConfig)

  await bot.sendPhoto(msg.chat.id, chartImageBuffer)
}

module.exports = { plot }

