const express = require('express')
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const SYSTEM = 'System'
const socketObj = {}
const userColor = ['#00a1f4', '#0cc', '#f44336', '#795548', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffc107', '#607d8b', '#ff9800', '#ff5722']

console.log("\33[2J")

// 设置静态文件夹
app.use(express.static(__dirname))

io.on('connection', socket => {
	// 监听客户端的消息
	let username
	let color

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
				// 就向所有人广播
				io.emit('message', {
					user: username,
					color,
					content: msg,
					createAt
				})
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