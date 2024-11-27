import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { saveInfo, startSend, stopSend, getStopFlag } from './send.js';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    icon: path.join(__dirname, './icon64.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  mainWindow.loadFile('index.html');
  mainWindow.removeMenu();
};


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 实时更新发送状态
export function autoSendStopFlag(stopFlag) {
  mainWindow.webContents.send('autoSendStopFlag', stopFlag);
}

// 保存信息
ipcMain.on('saveInfo', (event, newSpeed, tokens, newRoomId, newMessage) => {
  // console.log("Received saveInfo data:");
  // console.log("Speed:", newSpeed);
  // console.log("Tokens:", tokens);
  // console.log("Room ID:", newRoomId);
  // console.log("Message:", newMessage);

  saveInfo(newSpeed, tokens, newRoomId, newMessage);
});

// 开始发送
ipcMain.on('startSend', () => {
  startSend();
});

// 停止发送
ipcMain.on('stopSend', () => {
  stopSend();
});

// 获取停止状态
ipcMain.on('getStopFlag', (event) => {
  event.returnValue = getStopFlag();
});
