var net = require('net');
var fs = require('fs');

// This server listens on a Unix socket at /var/run/mysocket
var unixServer = net.createServer(function(connection) {
    console.log('unix client connected');
   
   connection.on('end', function() {
      console.log('unix client disconnected');
   });
   connection.write('UNIX Hello World!\r\n');
   connection.pipe(connection);
});

try {
    fs.unlink('./mysocket', e => console.log(e));
    unixServer.listen('./mysocket');
} catch (e){
    console.error(e);
}

// This server listens on TCP/IP port 1234
var tcpServer = net.createServer(function(connection) {
    console.log('TCP ipc client connected');
   
   connection.on('end', function() {
      console.log('TCP client disconnected');
   });
   connection.write('TCP IPC Hello World!\r\n');
   connection.pipe(connection);
});
tcpServer.listen(1234);