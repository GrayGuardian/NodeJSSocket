
var SocketServer = require("../socket/socketServer");


new SocketServer("127.0.0.1", 6854).listen((server) => {
    console.log(`创建SocketServer >>> ${server.address().address}:${server.address().port}`);
});







