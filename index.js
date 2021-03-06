// index.js文件
const socket = io();
// 监听与服务端的连接
socket.on('connect', () => {
  console.log('连接成功');
  socket.emit('getHistory')
});

socket.on('message', data => {
  appendNewMsg(data)
})

socket.on('joined', room => {
  handleJoinRoom(room)
})

socket.on('leaved', room => {
  handleLeaveRoom(room)
})

socket.on('history', history => {
  handleHistoryMsg(history)
})


// 列表list，输入框content，按钮sendBtn
let list = document.getElementById('list'),
  input = document.getElementById('input'),
  sendBtn = document.getElementById('sendBtn');

// 点击按钮发消息
sendBtn.onclick = send
// 回车发消息
input.onkeydown = (event) => enterSend(event)
// 私聊
list.onclick = e => privateChat(e)


function handleJoinRoom(room) {
  document.getElementById(`join-${room}`).style.display = 'none'
  document.getElementById(`leave-${room}`).style.display = 'inline-block'
}

function handleLeaveRoom(room) {
  document.getElementById(`leave-${room}`).style.display = 'none'
  document.getElementById(`join-${room}`).style.display = 'inline-block'
}

function handleHistoryMsg(history) {
  let html = history.map(data => {
    return `
    <li class="list-group-item">
      <p style="color: #ccc;"><span class="user" style="color:${data.color}">${data.user} </span>${data.createAt}</p>
      <p class="content" style="background-color: ${data.color}">${data.content}</p>
    </li>
    `
  }).join('')
  list.innerHTML = html + '<li style="margin: 16px 0;text-align: center">以上是历史消息</li>'
  list.scrollTop = list.scrollHeight
}

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
    input.focus()
  }
}

function join(room) {
  socket.emit('join', room)
}

function leave(room) {
  socket.emit('leave', room)
}

