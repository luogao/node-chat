const nanoid = require('nanoid')
const express = require('express')
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const { shuffle } =  require('./utils')

const SYSTEM = 'System'
const socketObj = {}
const mySocket = {}
const userColor = ['#00a1f4', '#0cc', '#f44336', '#795548', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffc107', '#607d8b', '#ff9800', '#ff5722']
const msgHistory = []

console.log("\33[2J")

// 设置静态文件夹
app.use(express.static(__dirname))

class User {
	constructor() {
		this.name = nanoid(10)
		this.color = shuffle(userColor)[0]
	}
}

function handleUserConnected(socket, user) {
	const createAt = new Date().toLocaleDateString()
	// socket.broadcast.emit 向除了自己的所有人广播，毕竟进没进入自己是知道的，没必要跟自己再说一遍
	socket.broadcast.emit('message', {
		user: SYSTEM,
		color: user.color,
		content: `${user.name} 加入了聊天！`,
		createAt
	})
	socketObj[user.name] = socket
}


function handlePrivateChat(options = {}) {
	const { fromUser, content, toSocket, createAt } = options
	if (toSocket) {
		toSocket.send({
			user: fromUser.name,
			color: fromUser.color,
			content,
			createAt
		})
	}
}

function getRoomSockets(io, rooms) {
	const socketJson = {}
	rooms.forEach(room => {
		// 取得进入房间内所对应的所有sockets的hash值，它便是拿到的socket.id
		let roomSockets = io.sockets.adapter.rooms[room].sockets
		Object.keys(roomSockets).forEach(socketId => {
			if (!socketJson[socketId]) {
				socketJson[socketId] = 1
			}

		})
	})
	return socketJson
}

io.on('connection', socket => {
	const user = new User()
	const username = user.name
	const color = user.color
	const rooms = []

	// 监听客户端的消息
	handleUserConnected(socket, user)

	mySocket[socket.id] = socket

	socket.on('message', msg => {

		const createAt = new Date().toLocaleDateString()
		// 正则判断消息是否为私聊专属
		const private = msg.match(/@([^ ]+) (.+)/)

		if (private) {
			// 私聊的用户，正则匹配的第一个分组
			let toUser = private[1]
			// 私聊的内容，正则匹配的第二个分组
			let content = private[2]
			// 从socketObj中获取私聊用户的socket
			let toSocket = socketObj[toUser]

			handlePrivateChat({
				fromUser: user,
				content,
				toSocket,
				createAt
			})
		} else {
			if (rooms.length) {
				const socketJson = getRoomSockets(io, rooms)
				Object.keys(socketJson).forEach(socketId => {
					mySocket[socketId].emit('message', {
						user: username,
						color,
						content: msg,
						createAt
					})
				})
			} else {
				// 如果不是私聊，向所有人广播
				io.emit('message', {
					user: username,
					color,
					content: msg,
					createAt
				})
				msgHistory.push({
					user: username,
					color,
					content: msg,
					createAt
				})
			}
		}
	});

	socket.on('join', room => {
		const createAt = new Date().toLocaleDateString()
		// 判断一下用户是否进入了房间，如果没有就让其进入房间内
		if (username && rooms.indexOf(room) === -1) {
			// socket.join表示进入某个房间
			socket.join(room)
			rooms.push(room)
			// 这里发送个joined事件，让前端监听后，控制房间按钮显隐
			socket.emit('joined', room)
			socket.send({
				user: SYSTEM,
				color,
				content: `你已加入${room}战队`,
				createAt
			})
		}
	})

	socket.on('leave', room => {
		const createAt = new Date().toLocaleDateString()
		// index为该房间在数组rooms中的索引，方便删除
		let index = rooms.indexOf(room)
		if (index !== -1) {
			socket.leave(room); // 离开该房间
			rooms.splice(index, 1); // 删掉该房间
			// 这里发送个leaved事件，让前端监听后，控制房间按钮显隐
			socket.emit('leaved', room);
			// 通知一下自己
			socket.send({
				user: SYSTEM,
				color,
				content: `你已离开${room}战队`,
				createAt
			});
		}
	})

	socket.on('getHistory', () => {
		// 通过数组的slice方法截取最新的20条消息
		if (msgHistory.length) {
			let history = msgHistory.slice(msgHistory.length - 20)
			socket.emit('history', history)
		}
	})

});


server.listen(4000, function () {
	console.log('listening on:4000');
});
