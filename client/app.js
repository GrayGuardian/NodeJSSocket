
var SocketClient = require("../socket/socketClient");

var client = new SocketClient("127.0.0.1", 6854)

client.on("onConnectSuccess", () => {
    console.log("常驻回调>>连接成功");
})
client.on("onConnectError", () => {
    console.log("常驻回调>>连接失败");
})
client.on("onDisConnect", () => {
    console.log("常驻回调>>断开连接");
})
client.on("onReceive", (dataPack) => {
    console.log("常驻回调>>server to client >>> ", dataPack.type);
})
client.on("onSend", (dataPack) => {
    console.log("常驻回调>>client to server >>> ", dataPack.type);
})
client.on("onError", (ex) => {
    console.log("常驻回调>>捕获异常 >>> ", ex.code);
})
client.on("onReconnecting", (index) => {
    console.log(`常驻回调>>正在进行第${index}次重连`);
})
client.on("onReConnectSuccess", (index) => {
    console.log(`常驻回调>>第${index}次重连成功`);
})
client.on("onReConnectError", (index) => {
    console.log(`常驻回调>>第${index}次重连失败`);
})

client.connect(() => {
    console.log("连接成功");
}, () => {
    console.log("连接失败");
});







