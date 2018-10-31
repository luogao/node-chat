
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

module.exports = {
  shuffle
}