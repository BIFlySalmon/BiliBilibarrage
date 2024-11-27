import axios from 'axios';
import { dialog } from 'electron';
import { autoSendStopFlag } from './main.js';

let stopFlag = true;

let speed;
let tokens = []; // 存储多个用户令牌
let roomId;
let message;
let currentTokenIndex = 0; // 当前使用的令牌索引

export async function autoSend() {
  const sendLoop = async () => {
    if (stopFlag) return;

    if (tokens.length === 0) {
      stopSend();
      showErrorDialog('没有可用的用户令牌，停止发送！');
      return;
    }

    // 获取当前的令牌
    const currentToken = tokens[currentTokenIndex];

    // 发送弹幕
    const result = await sendDanmaku(currentToken);

    if (result.success) {
      // 切换到下一个令牌
      currentTokenIndex = (currentTokenIndex + 1) % tokens.length;

      // 设置随机延迟
      const randomInterval = speed * 1000 + Math.random() * 1000 + 500;
      setTimeout(sendLoop, randomInterval);
    }
  };

  sendLoop();
}

export function startSend() {
  stopFlag = false;
  autoSend();
  autoSendStopFlag(stopFlag);
  dialog.showMessageBox({
    type: 'info',
    title: '已启动',
    message: '发送已开始',
    detail: '若无错误信息，则可以去直播间查看效果',
    buttons: ['确认'],
  });
}

export function stopSend() {
  stopFlag = true;
  autoSendStopFlag(stopFlag);
  dialog.showMessageBox({
    type: 'info',
    title: '已停止',
    message: '发送停止',
    detail: '发送已结束，感谢您的使用~',
    buttons: ['确认'],
  });
}

export function getStopFlag() {
  return stopFlag;
}

export function saveInfo(newSpeed, newTokens, newRoomId, newMessage) {
  // 校验输入数据
  if (newMessage.length >= 18) {
    showErrorDialog('弹幕内容超过最大字数');
    return;
  }

  if (!newRoomId || !newMessage || !newSpeed) {
    showErrorDialog('直播间 ID 和弹幕内容不能为空！');
    return;
  }

  if (!Array.isArray(newTokens) || newTokens.length === 0) {
    showErrorDialog('至少需要提供一个有效的用户令牌！');
    return;
  }

  // 更新数据
  speed = newSpeed;
  tokens = newTokens; // 保存令牌数组
  roomId = newRoomId;
  message = newMessage;

  dialog.showMessageBox({
    type: 'info',
    title: '已保存',
    message: '本次配置保存成功',
    detail: '为保证信息安全，关闭应用立即删除信息',
    buttons: ['确认'],
  });
  // console.log(tokens);
}

export async function sendDanmaku(token) {
  const { bili_jct, sessdata } = token;
  const cookie = `SESSDATA=${sessdata}; bili_jct=${bili_jct};`;

  const url = 'https://api.live.bilibili.com/msg/send';
  const data = {
    bubble: 0,
    msg: message + parseInt(Math.random() * 1000),
    color: 16777215,
    mode: 1,
    room_type: 0,
    fontsize: 25,
    rnd: Math.floor(Date.now() / 1000),
    roomid: roomId,
    csrf: bili_jct,
    csrf_token: bili_jct,
  };

  try {
    const response = await axios.post(url, new URLSearchParams(data), {
      headers: {
        Cookie: cookie,
        Referer: `https://live.bilibili.com/${roomId}`,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      },
    });

    if (response.data.code === 0) {
      return { success: true };
    } else {
      console.log(response);
      if (response.data.message === '请求错误') {
        showErrorDialog('请求错误，请检查填写数据是否有误');
      } else {
        showErrorDialog(response.data.message || '发送弹幕失败，未知错误。');
      }
      return { success: false };
    }
  } catch (error) {
    showErrorDialog(error.message || '网络请求错误。');
    return { success: false };
  }
}

function showErrorDialog(message) {
  dialog.showErrorBox('发送弹幕失败', message);
}
