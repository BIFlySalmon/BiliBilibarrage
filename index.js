const startSend = document.getElementById('startSend');
const stopSend = document.getElementById('stopSend');
const saveButton = document.getElementById('saveInfo');

// 动态添加凭证输入框
document.getElementById('addToken').addEventListener('click', function () {
  const tokensContainer = document.getElementById('tokensContainer');
  const tokenCount = tokensContainer.querySelectorAll('.tokenGroup').length;

  const tokenGroup = document.createElement('div');
  tokenGroup.className = 'tokenGroup';
  tokenGroup.innerHTML = `
    <label for="bili_jct_${tokenCount}">bili_jct:</label>
    <input id="bili_jct_${tokenCount}" type="password" />
    <label for="sessdata_${tokenCount}">SESSDATA:</label>
    <input id="sessdata_${tokenCount}" type="password" />
    <button class="deleteToken">删除</button>
  `;
  tokensContainer.appendChild(tokenGroup);
});

// 删除动态添加的凭证组（事件委托）
document.getElementById('tokensContainer').addEventListener('click', function (event) {
  if (event.target.classList.contains('deleteToken')) {
    const tokenGroup = event.target.parentElement;
    tokenGroup.remove();
  }
});

// 保存按钮事件
saveButton.addEventListener('click', () => {
  const tokensContainer = document.getElementById('tokensContainer');
  const tokenGroups = tokensContainer.querySelectorAll('.tokenGroup');

  const tokens = [];
  tokenGroups.forEach((group, index) => {
    const bili_jct = group.querySelector(`#bili_jct_${index}`)?.value.trim();
    const sessdata = group.querySelector(`#sessdata_${index}`)?.value.trim();
    if (bili_jct && sessdata) {
      tokens.push({ bili_jct, sessdata });
    }
  });

  const newRoomId = document.getElementById('roomid').value.trim();
  const newMessage = document.getElementById('message').value.trim();
  const newSpeed = document.getElementById('speed').value.trim();

  // 发送信息到主进程
  window.bilibili.saveInfo(newSpeed, tokens, newRoomId, newMessage);
});

// 开始发送事件
startSend.addEventListener('click', () => {
  window.bilibili.startSend();
  refreshStopFlag();
});

// 停止发送事件
stopSend.addEventListener('click', () => {
  window.bilibili.stopSend();
  refreshStopFlag();
});

// DOM加载后刷新状态
document.addEventListener('DOMContentLoaded', () => {
  refreshStopFlag();
});

// 自动刷新发送状态
window.bilibili.autoSendStopFlag((event, stopFlag) => {
  startSend.disabled = !stopFlag;
  stopSend.disabled = stopFlag;
});

// 更新按钮状态
function refreshStopFlag() {
  const stopFlag = window.bilibili.getStopFlag();
  startSend.disabled = !stopFlag;
  stopSend.disabled = stopFlag;
}
