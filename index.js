// index.js文件
const socket = io();
// 监听与服务端的连接
socket.on('connect', () => {
  console.log('连接成功');
});

socket.on('message', data => {
  appendNewMsg(data)
})

// 列表list，输入框content，按钮sendBtn
let list = document.getElementById('list'),
  input = document.getElementById('input'),
  sendBtn = document.getElementById('sendBtn');

sendBtn.onclick = send
input.onkeydown = (event) => enterSend(event)


function appendNewMsg(msgData) {
  const li = document.createElement('li')
  li.className = 'list-group-item'
  li.innerHTML = `
    <p style='color:#ccc'>
      <span class='user' style='color: ${msgData.color}'>${msgData.user}</span>
      ${msgData.createAt}
    </p>
    <p class='content' style='background: ${msgData.color}'>${msgData.content}</p>
  `
  list.appendChild(li)
  list.scrollTop = list.scrollHeight
}

function send() {
  let value = input.value

  if (value) {
    socket.emit('message', value)
    input.value = ''
  }
  else {
    alert('输入的内容不能为空！')
  }
}

function enterSend(event) {
  const code = event.keyCode
  if (code === 13) send()
}

function privateChat(e) {
  const target = event.target

  const user = target.innerHTML

  if (target.className === 'user') {
    // 将@用户名显示在input输入框中
    input.value = `@${user} `
  }
}

list.onclick = e => privateChat(e)