var net = require('net');
var tcpClient = net.connect({port: 1234}, function() {
   console.log('connected to server!');  
});
tcpClient.on('data', function(data) {
   console.log('Message from TCP Server:' + data.toString());
   tcpClient.end();
});
tcpClient.on('end', function() { 
   console.log('disconnected from server');
});


var unixClient = net.connect({path: './mysocket'}, function() {
    console.log('connected to UNIX Socket!');  
 });
 unixClient.on('data', function(data) {
    console.log('Message from UNIX Server:' + data.toString());
    unixClient.end();
 });
 unixClient.on('end', function() { 
    console.log('disconnected from server');
 });