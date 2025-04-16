const { app, BrowserWindow, ipcMain } = require("electron");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const { autoUpdater } = require("electron-updater");

let mainWindow;
let port = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile("index.html");
}

app.on("ready", () => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.on("find-arduino", async () => {
  const ports = await SerialPort.list();
  for (const p of ports) {
    const testPort = new SerialPort({ path: p.path, baudRate: 9600 });
    const parser = testPort.pipe(new ReadlineParser({ delimiter: "\n" }));

    parser.once("data", (data) => {
      if (data.trim() === "ECHO_RESPONSE") {
        port = testPort;
        mainWindow.webContents.send("arduino-found", p.path);
        parser.once("data", (data) => {
          mainWindow.webContents.send("arduino-data", data);
        });
      }
    });

    testPort.write("ECHO_REQUEST\n");
    // Закрываем порт, если это не нужный порт
    setTimeout(() => {
      if (port !== testPort) {
        testPort.close();
      }
    }, 1000);
  }

  if (!port) {
    mainWindow.webContents.send("arduino-not-found");
  }
});

ipcMain.on("send-data", (event, data) => {
  if (port) {
    port.write(data + "\n");
  }
});

ipcMain.on("GET_INFO", (event, data) => {
  if (port) {
    port.write("GET_INFO" + "\n");
    const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
    parser.once("data", (data) => {
      try {
        const [speed, temp] = data.trim().split("::");
        mainWindow.webContents.send("ECHO_GET_INFO", [speed, temp]);
      } catch (e) {
        console.warn("GET_INFO ERROR", e);
      }
    });
  }
});

// autoUpdater.on('update-available', (info) => {
//   mainWindow.webContents.send('update-available', info);
// });

// autoUpdater.on('update-downloaded', (info) => {
//   mainWindow.webContents.send('update-downloaded', info);
// });

// ipcMain.on('download-update', () => {
//   autoUpdater.downloadUpdate();
// });

// ipcMain.on('install-update', () => {
//   autoUpdater.quitAndInstall();
// });
