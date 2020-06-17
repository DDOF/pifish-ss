import socket from 'socket.io'
import sensorLib from 'node-dht-sensor'
import Radio from '433-utils';
import fs from 'fs';
import http from 'http'

let rawdata = fs.readFileSync('remote.json');
let remote = JSON.parse(rawdata);

const {Receiver, Transmitter} = Radio;
const port = 3000
let transmitter = new Transmitter(0); // Set PIN -> GPIO 17

const app = http.createServer((req, res) => {

  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.write('Hello')
  res.end()
})
app.listen(port, () => {
  console.log(`server started on port ${port}`)
})
const listener = socket.listen(app, {'log': false})


listener.sockets.on('connection', (client) => {
  console.log('connect')

  client.on('light', (data) => {
    transmitter.codeSend(remote[data], 1, 0)
  })
})




const loop = () => {
  setTimeout(() => {
    const readout = sensorLib.read(
      11,
      4
    )
    listener.emit('temp', Math.round(readout.temperature * 2) / 2)
    console.log(
      `temperature: ${readout.temperature}°C, ` +
      `humidity: ${readout.humidity.toFixed(1)}%`)
    loop()
  }, 1000)
}

loop()

