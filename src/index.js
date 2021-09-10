const express = require('express')
const app = express()
const port = 5000

const fs = require('fs')
const file_path = './src/logs/status.json'
const logger = require('./modules/logger')

const mqtt_params = {
  protocol: 'mqtt',
  host: 'raspberrypi.local',
  port: 1883,
  username: 'admin',
  password: 'admin1234'
}
const mqtt = require('mqtt')
const mqtt_client  = mqtt.connect(mqtt_params)

// MQTT connect
mqtt_client.on('connect', () => {
  logger.debug('MQTT client connected to brocker')
  logger.debug('host:' + mqtt_params.host)
  logger.debug('port:' + mqtt_params.port)
  mqtt_client.subscribe('topic-connect')
  mqtt_client.subscribe('topic-status')
})

mqtt_client.on('error', (error) => {
  logger.error(error)
})

mqtt_client.on('message', (topic, message) => {
  // message is Buffer
  logger.debug(topic)
  logger.debug(message.toString())
  if (topic == 'topic-connect') {
    logger.info(message.toString())
  }
  if (topic == 'topic-status') {
    const result = JSON.stringify(message.toString())
    fs.writeFileSync(file_path, message.toString())
    logger.info(result)
  }
})

process.on('beforeExit', () => {
  logger.debug('closing mqtt client...')
  mqtt_client.close()
})

// WEB server start
app.listen(port)
logger.debug('Server started! listen Port: ' + port)

app.get('/api/play', (req, res) => {
  logger.debug('GET /api/play')
  mqtt_client.publish('operation', "1")
  logger.debug("mqtt_client.publish('operation', 'play')")
  res.json({ message: 'success' })
})

app.get('/api/pause', (req, res) => {
  logger.debug('GET /api/pause')
  mqtt_client.publish('operation', "2")
  logger.debug("mqtt_client.publish('operation', 'pause')")
  res.json({ message: 'success' })
})

app.get('/api/next', (req, res) => {
  logger.debug('GET /api/next')
  mqtt_client.publish('operation', "3")
  logger.debug("mqtt_client.publish('operation', 'next')")
  res.json({ message: 'success' })
})

app.get('/api/previous', (req, res) => {
  logger.debug('GET /api/previous')
  mqtt_client.publish('operation', "4")
  logger.debug("mqtt_client.publish('operation', 'previous')")
  res.json({ message: 'success' })
})

app.post('/api/status', (req, res) => {
  logger.debug('POST /api/status')
  mqtt_client.publish('operation', 　"5")
  logger.debug("mqtt_client.publish('operation', 'status')")
  res.json({ message: 'success' })
})

app.get('/api/status', (req, res) => {
  logger.debug('GET /api/status')
  const jsonObject = JSON.parse(fs.readFileSync(file_path, 'utf8'));
  res.json(jsonObject)
})

app.get('/api/select', (req, res) => {
  const index = req.query.index
  logger.debug("GET /api/select?index=" + index)
  const command = Number(index) + 6
  mqtt_client.publish('operation', String(command))
  res.json({ message: 'success' })
})
