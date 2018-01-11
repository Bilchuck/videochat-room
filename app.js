const WebSocketServer = require('websocket').server;
const http = require('http');
const path = require("path");
const express = require('express')
const app = express()

app.listen(1338, () => console.log('Example app listening on port 3000!'))
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});
app.use(express.static('public'));
app.use(express.static('build'));
app.use(express.static('build/static'));

var server = http.createServer();
server.listen(1337, function() { });

wsServer = new WebSocketServer({
  httpServer: server
});
let users = [];
const NAME_PROP = Symbol("NAME_PROP");
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    connection.on('message', function(message) {
        message = JSON.parse(message.utf8Data);
        switch (message.type) {
            case "login": {
                if (!users.includes(connection)) {
                    connection[NAME_PROP] = message.name;
                    users.push(connection);
                    sendMessage(connection, "login", { success: true });
                } else {
                    sendMessage(connection, "login", { success: false });
                }
                break;
            }
            case "offer": {
                const {partnerName, offer} = message;
                const sendTo = users.find(c => c[NAME_PROP] === partnerName);
                if (sendTo) {
                    const from = connection[NAME_PROP];
                    sendMessage(sendTo, "offer", { offer, from });
                }
                break;
            }
            case "answer": {
                const {partnerName, answer} = message;
                const sendTo = users.find(c => c[NAME_PROP] === partnerName);
                if (sendTo) {
                    sendMessage(sendTo, "answer", { answer });
                }
                break;
            }
            case "candidate": {
                const {partnerName, candidate} = message;
                const sendTo = users.find(c => c[NAME_PROP] === partnerName);
                if (sendTo) {
                    sendMessage(sendTo, "candidate", { candidate });
                }
                break;
            }
        }
    });
    const sendMessage = (con = connection, type, message) => 
        con.send(JSON.stringify({...message, type}));

    connection.on('close', function() {
        if (users.includes(connection)) {
            users = users.filter(c => c !== connection);
        }
    });
});
