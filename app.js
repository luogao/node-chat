const express = require('express')
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const SYSTEM = 'System'
const socketObj = {}
const mySocket = {}
const userColor = ['#00a1f4', '#0cc', '#f44336', '#795548', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffc107', '#607d8b', '#ff9800', '#ff5722']
const msgHistory = []

console.log("\33[2J")

// 设置静态文件夹
app.use(express.static(__dirname))

io.on('connection', socket => {
	// 监听客户端的消息
	let username
	let color
	let rooms = []

	mySocket[socket.id] = socket

	socket.on('message', msg => {

		const createAt = new Date().toLocaleDateString()
		if (username) {
			// 正则判断消息是否为私聊专属
			const private = msg.match(/@([^ ]+) (.+)/)

			if (private) {
				// 私聊的用户，正则匹配的第一个分组
				let toUser = private[1]

				// 私聊的内容，正则匹配的第二个分组
				let content = private[2]

				// 从socketObj中获取私聊用户的socket
				let toSocket = socketObj[toUser]

				if (toSocket) {
					toSocket.send({
						user: username,
						color,
						content,
						createAt
					})
				}
			} else {

				if (rooms.length) {
					let socketJson = {}

					rooms.forEach(room => {
						// 取得进入房间内所对应的所有sockets的hash值，它便是拿到的socket.id
						let roomSockets = io.sockets.adapter.rooms[room].sockets
						Object.keys(roomSockets).forEach(socketId => {
							console.log('socketId', socketId)

							if (!socketJson[socketId]) {
								socketJson[socketId] = 1
							}

						})
					})

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
						user:username,
						color,
						content:msg,
						createAt
					})
				}
			}
		} else {

			// 如果是第一次进入的话，就将输入的内容当做用户名
			username = msg

			color = shuffle(userColor)[0]
			// socket.broadcast.emit 向除了自己的所有人广播，毕竟进没进入自己是知道的，没必要跟自己再说一遍
			socket.broadcast.emit('message', {
				user: SYSTEM,
				color,
				content: `${username} 加入了聊天！`,
				createAt
			})

			socketObj[username] = socket

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

// 乱序排列方法，方便把数组打乱

function shuffle(arr) {
	let len = arr.length, random

	while (0 !== len) {
		// 右移位运算符向下取整
		random = (Math.random() * len--) >>> 0;
		// 解构赋值实现变量互换
		[arr[len], arr[random]] = [arr[random], arr[len]]
	}

	return arr

}