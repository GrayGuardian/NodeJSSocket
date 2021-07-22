# NodeJsSocket
该项目是基于NodeJs平台 纯JS编写的Socket网络模块，包括客户端与服务端的实现 

**基于Unity平台下的Socket网络通信模块** >>> [前往项目](https://github.com/GrayGuardian/UnitySocket)

## 环境依赖 

- 项目运行平台： Node.js

## 特点
1. 回调事件完善，包含服务器主动踢出、客户端主动断开、心跳包等底层功能逻辑。 
2. 对象形式，非单例模式，一个项目可new多个连接
3. 代码量少，纯JS编写，未使用插件、DLL及工具类，便于二次封装，利于移植
## 报文组成
- 通用

	报文总长度(4byte) + 报文类型(2byte) + 数据(N byte)

- 心跳包 

	报文总长度(4byte) + 报文类型-心跳包(2byte)

- 客户端断开
	
	报文总长度(4byte) + 报文类型-客户端断开(2byte)

- 服务端踢出
	
	报文总长度(4byte) + 报文类型-服务端踢出(2byte)

## 工作流
- 建立连接
	1. 服务端通过 new SocketServer(string ip,int port) 建立连接
	2. 客户端通过 new SocketClient(string ip,int port) 建立实例，通过Connect函数尝试连接。
	3. 客户端连接成功后，开始定时发送心跳包报文；服务端接收后记录时间，定时检测判断是否超时。 
	4. 如存在以下情况，则断开连接：
		- 服务端主动踢出连接，即时响应，回调DisConnect
		- 客户端主动断开连接，即时响应，回调DisConnect
		- 客户端关闭连接，即时响应，回调DisConnect
		- 服务端检测到客户端太久没有发送心跳包，此处需要响应时间，根据心跳包超时间隔、心跳包发送间隔及服务端心跳包超时检测间隔来决定，发现超时则回调DisConnect
		- 通信逻辑过程中报错，即时响应，自动重连，默认重连上限为三次，达到重连上限并未成功，则回调DisConnect
- 接收数据 
	1. 接收线程收到数据，存放入DataBuff数据缓存区。
	2. DataBuff中不断通过SocketDataPack尝试解包，解包成功后将报文发送到接收线程。
	3. 接收线程收到报文后，触发OnReceive回调
	4. 业务层通过OnReceive回调接收到报文后，反序列化报文体得到数据
- 发送数据
	1. 业务层序列化数据得到报文体字节集，通过Send函数发送数据。
	2. Send函数中，通过SocketDataPack装包后，以字节集的形式发送出去。 

## 代码说明 
- DataBuffer：Socket传输数据缓存区，此处主要处理Socket传输时粘包、分包的情况
- SocketEvent：Socket报文类型枚举，此处只枚举了网络底层需要发送的报文类型，业务逻辑层所使用的报文类型，建议封装至报文体序列化类中
- SocketDataPack：Socket报文类，处理具体的拆包、装包逻辑
- SocketServer：Socket服务端
- SocketClient：Socket客户端

## 回调事件
- SocketServer	服务端
	- on("onConnect", (socket) => { })	//客户端建立连接回调
	- on("onDisconnect", (socket, hadError) => { })	// 客户端断开连接回调
	- on("onReceive", (socket, dataPack) => { })	// 接收报文回调
	- on("onSend", (socket, dataPack) => { })	// 发送报文回调
	- on("onError", (ex) => { })	// 异常捕获回调
- SocketClient	客户端
	- on("onConnectSuccess", () => { })	// 连接成功回调
	- on("onConnectError", () => { })	// 连接失败回调
	- on("onDisConnect", () => { })	// 断开回调
	- on("onReceive", (dataPack) => { })	// 接收报文回调
	- on("onSend", (dataPack) => { })	// 发送报文回调
	- on("onError", (ex) => { })	// 异常捕获回调
	- on("onReConnectSuccess", () => { })	// 重连成功回调
	- on("onReConnectError", () => { })	// 单次重连失败回调
	- on("onReconnecting", () => { })	// 单次重连中回调