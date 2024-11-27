const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bilibili', {
  /**
   * 保存配置信息，包括多个用户令牌
   * @param {number} newSpeed - 弹幕发送速度
   * @param {Array} newTokens - 用户令牌数组，每个令牌对象包含 { bili_jct, sessdata }
   * @param {string} newRoomId - 直播间 ID
   * @param {string} newMessage - 弹幕内容
   */
  saveInfo: (newSpeed, newTokens, newRoomId, newMessage) => 
    ipcRenderer.send('saveInfo', newSpeed, newTokens, newRoomId, newMessage),

  /**
   * 开始发送弹幕
   */
  startSend: () => ipcRenderer.send('startSend'),

  /**
   * 停止发送弹幕
   */
  stopSend: () => ipcRenderer.send('stopSend'),

  /**
   * 获取当前停止状态（同步方法）
   * @returns {boolean} 停止标志
   */
  getStopFlag: () => ipcRenderer.sendSync('getStopFlag'),

  /**
   * 监听停止状态的自动更新
   * @param {function} callback - 回调函数，接收事件和停止标志
   */
  autoSendStopFlag: (callback) => ipcRenderer.on('autoSendStopFlag', callback),
});
