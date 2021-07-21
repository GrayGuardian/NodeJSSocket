
const net = require('net')
const DataBuffer = require("./dataBuffer");
const SocketDataPack = require('./socketDataPack');
const SocketEvent = require('./socketEvent');

const HEAD_TIMEOUT = 5000;    // 心跳超时 毫秒
const HEAD_CHECKTIME = 5000;   // 心跳包超时检测 毫秒

var SocketServer = function (ip, port) {
    this.ip = ip
    this.port = port

    this.clientInfoMap = new Map();

    this.dataBuffer = new DataBuffer();
};
SocketServer.prototype.listen = function (cb) {
    this.server = new net.createServer();
    this.server.on("connection", (socket) => {
        this.onConnect(socket);
        socket.on("data", (data) => {
            this.dataBuffer.addBuffer(data);
            let dataPack = this.dataBuffer.TryUnpack();
            if (dataPack != null) {
                switch (dataPack.type) {
                    case SocketEvent.sc_head:
                        this.receiveHead(socket);
                        break;
                    case SocketEvent.sc_disconn:
                        // 自动会回调close消息，此处可以不需要额外操作
                        // console.log("客户端主动断开连接");
                        break;
                    default:
                        this.onReceive(socket, dataPack);
                        break;
                }
            }
        });
        socket.on("close", (hadError) => {
            this.onDisconnect(socket, hadError);
        });
    });
    this.server.listen(this.port, this.ip, () => {
        setInterval(() => {
            this.checkHeadTimeOut();
        }, HEAD_CHECKTIME);
        if (cb != null) cb(this.server);
    });
}
SocketServer.prototype.checkHeadTimeOut = function () {
    var temp = new Map();
    this.clientInfoMap.forEach(function (value, key) {
        temp.set(key, value);
    });
    temp.forEach((info, socket) => {
        let offset = Date.now() - info.headTime;
        if (offset > HEAD_TIMEOUT) {
            // 超时踢出
            this.kickOut(socket);
        }
    });

}
SocketServer.prototype.send = function (socket, type, data, cb) {
    let dataPack = new SocketDataPack(type, data);
    socket.write(dataPack.buff, "utf8", () => {
        // 此处可广播回调
        console.log("server to client >>> ", `${socket.remoteAddress}:${socket.remotePort}`, dataPack.type);
        if (cb != null) cb();
    });
}
SocketServer.prototype.kickOut = function (socket) {
    this.send(socket, SocketEvent.sc_kickout, null, () => {
        this.closeClient(socket);
    });
}
SocketServer.prototype.kickOutAll = function () {
    var temp = [];
    this.clientInfoMap.forEach(function (value, key) {
        temp.push(key);
    });
    temp.forEach(socket => {
        this.kickOut(socket);
    });

}
SocketServer.prototype.closeClient = function (socket) {
    delete this.clientInfoMap[socket]
    socket.destroy();
}
SocketServer.prototype.receiveHead = function (socket) {
    this.clientInfoMap.set(socket, { headTime: Date.now() });
    // console.log("更新心跳包间隔 >>> now > ", Date.now());
}
SocketServer.prototype.onConnect = function (socket) {
    this.clientInfoMap.set(socket, { headTime: Date.now() });
    // 此处可广播回调
    console.log("客户端连接 >>> ", `${socket.remoteAddress}:${socket.remotePort}`);
}

SocketServer.prototype.onReceive = function (socket, dataPack) {
    // 此处可广播回调
    console.log("client to server >>> ", `${socket.remoteAddress}:${socket.remotePort}`, dataPack.type);
}

SocketServer.prototype.onDisconnect = function (socket, hadError) {
    // 此处可广播回调
    console.log("客户端断开 >>> ", `${socket.remoteAddress}:${socket.remotePort}`, hadError);
    this.closeClient(socket);
}

module.exports = function (ip, port) {
    return new SocketServer(ip, port);
}