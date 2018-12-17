var express = require("express");
var http = require("http");
var websocket = require("ws");
var Game = require("./game");
var gameStatus = require("./gameStatus");


var port = process.argv[2];
var app = express();

app.use(express.static(__dirname + "/public"));
var server = http.createServer(app).listen(port);

app.set('view engine', 'ejs');
app.get("/", (req, res) => {
  res.render('splash.ejs', { gamesInitialized: gameStatus.gamesInitialized, gamesCompleted: gameStatus.gamesCompleted, online: connectionID });
});

app.get("/", function (req, res) {
  res.sendFile("splash.html", { root: "./public" });
});

const wss = new websocket.Server({ server });

var connectionID = 0; //unique ID per websocket
var websockets = {};
var currentGame = new Game(gameStatus.gamesInitialized++);

setInterval(function () {
  for (let i in websockets) {
    if (websockets.hasOwnProperty(i)) {
      let gameObj = websockets[i];
      //if the gameObj has a final status, the game is complete/aborted
      if (gameObj.finalStatus != null) {
        console.log("\tDeleting element " + i);
        delete websockets[i];
      }
    }
  }
}, 50000);


wss.on('connection', function connection(ws) {

  let con = ws;

  con.id = connectionID++;
  let playerType = currentGame.addPlayer(con);
  websockets[con.id] = currentGame;


  con.send(JSON.stringify({ data: playerType }));

  if (currentGame.hasTwoConnectedPlayers()) {
    currentGame = new Game(gameStatus.gamesInitialized++);
  }

  con.on("message", function incoming(message) {
    let oMsg = JSON.parse(message);

    if (oMsg.messageType === 'win') {
      gameStatus.gamesCompleted++;
    }

    let gameObj = websockets[con.id];
    let isPlayerA = (gameObj.playerA == con) ? true : false;

    if (isPlayerA) {
      gameObj.playerB.send(message);
    } else {
      gameObj.playerA.send(message);
    }
  });

  con.on('close', function (code) {
    if (code == "1001") {
      gameStatus.gamesAborted++;
      let gameObj = websockets[con.id];
      console.log(con.id + " disconnected ...");
      try {
        gameObj.playerA.close();
        gameObj.playerA = null;
      }
      catch (e) {
        console.log("Player A closing: " + e);
      }

      try {
        gameObj.playerB.close();
        gameObj.playerB = null;
      }
      catch (e) {
        console.log("Player B closing: " + e);
      }
    }
  });
});