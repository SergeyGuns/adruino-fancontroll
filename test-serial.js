const {SerialPort} = require('serialport');
const {ReadlineParser} = require('@serialport/parser-readline');
SerialPort.list().then((ports) => {
const arduinoPort = ports.find((port) => /arduino|usbserial/i.test(port.manufacturer));
console.log(ports, arduinoPort)
if (arduinoPort) {
    port = new SerialPort({ path: arduinoPort.path,  baudRate: 9600 });
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
    parser.on('data', (data) => {
    console.log(data)
    
    });
    console.log('arduino-found', arduinoPort.path);
} else {
    console.log('arduino-not-found');
}
});