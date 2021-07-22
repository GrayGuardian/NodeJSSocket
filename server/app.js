
var SocketServer = require("../socket/socketServer");

var server = new SocketServer("127.0.0.1", 6854);
server.on("onConnect", (socket) => {
    console.log("客户端连接 >>> ", `${socket.remoteAddress}:${socket.remotePort}`);
});
server.on("onDisconnect", (socket, hadError) => {
    console.log("客户端断开 >>> ", `${socket.remoteAddress}:${socket.remotePort}`, hadError);
});
server.on("onReceive", (socket, dataPack) => {
    console.log("client to server >>> ", `${socket.remoteAddress}:${socket.remotePort}`, dataPack.type);
});
server.on("onSend", (socket, type, data) => {
    console.log("server to client >>> ", `${socket.remoteAddress}:${socket.remotePort}`, dataPack.type);
});
server.on("onError", (ex) => {
    console.log("捕获异常 >>> ", ex.code);
});

server.listen((server) => {
    console.log(`创建SocketServer >>> ${server.address().address}:${server.address().port}`);
});







