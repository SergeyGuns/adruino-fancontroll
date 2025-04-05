
const { ipcRenderer } = require('electron');

document.getElementById('find-arduino').addEventListener('click', () => {
  ipcRenderer.send('find-arduino');
});

ipcRenderer.on('arduino-found', (event, port) => {
  console.log(`Arduino found on port: ${port}`);
  ipcRenderer.send('send-data', 'GET_FAN_COUNT');
});

ipcRenderer.on('arduino-not-found', (event, ports) => {
  console.log('Arduino not found', ports);
});

ipcRenderer.on('arduino-data', (event, data) => {
  const fanCount = parseInt(data, 10);
  const controlsDiv = document.getElementById('controls');
  controlsDiv.innerHTML = '';

  for (let i = 0; i < fanCount; i++) {
    const fanControl = document.createElement('div');
    fanControl.innerHTML = `<label>Fan ${i + 1}: <input type="range" min="0" max="255" /></label>`;
    const fanSlider = fanControl.querySelector('input');
    fanSlider.addEventListener('input', (event) => {
      const speed = event.target.value;
      ipcRenderer.send('send-data', `SET_FAN ${i} ${speed}`);
    });
    controlsDiv.appendChild(fanControl);
  }
});