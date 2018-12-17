const $board1 = $('#board1');
const $board2 = $('#board2');

// const $ships1 = $('#ships1');
// const $ships2 = $('#ships2');
// const $ships3 = $('#ships3');
// const $ships4 = $('#ships4');

const $ships = $('#ships');
var shipid;

const boardsize = 10;
const maxshipsize = 4;

var gamestate = null;

function ScreenSizeAlert() {
  if ($(window).height() < 300 || $(window).width() < 1000)
    alert('You screen size is bellow recommended.');
}
ScreenSizeAlert();

function createBoard(board, $board) {
  for (let i = 1; i <= board.size; i++) {
    const $row = $('<div>').addClass('row' + ' ' + i);
    for (let j = 1; j <= board.size; j++) {
      const $col = $('<div>').addClass('col hidden' + ' ' + j);
      if ($board == $board1) {
        $col.attr('ondrop', 'drop(event)');
        $col.attr('ondragover', 'allowDrop(event)');
      }
      $row.append($col);
    }
    $board.append($row);
  }
}


function validMove($colon, size, vertical) {
  if ($colon.hasClass("shipz")) return false;
  for (let m = 0; m < size; m++) {
    if (($colon.hasClass("hidden")) == false) return false;
    if (vertical) {
      var indexchild = $colon.index();
      $colon = $colon.closest('.row').next().children().eq(indexchild);
    }
    else $colon = $colon.next();
    if ($colon.hasClass("shipz"))
      return false;
  }
  return true;
}

function validMove2(shiplocation, size, vertical) {
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < myboard.location.length; i++) {
      if ((myboard.location[i].x - 1 == shiplocation.x && myboard.location[i].y + 1 == shiplocation.y) ||
        (myboard.location[i].x - 1 == shiplocation.x && myboard.location[i].y - 1 == shiplocation.y) ||
        (myboard.location[i].x + 1 == shiplocation.x && myboard.location[i].y + 1 == shiplocation.y) ||
        (myboard.location[i].x + 1 == shiplocation.x && myboard.location[i].y - 1 == shiplocation.y) ||
        (myboard.location[i].x == shiplocation.x && myboard.location[i].y + 1 == shiplocation.y) ||
        (myboard.location[i].x == shiplocation.x && myboard.location[i].y - 1 == shiplocation.y) ||
        (myboard.location[i].x - 1 == shiplocation.x && myboard.location[i].y == shiplocation.y))
        return false;
    }
    if (vertical) shiplocation.x++;
    else shiplocation.y++;
  }
  return true;
}



function Board(size) {
  this.size = size;
  this.ships = [];
  this.addShip = function (ship) {
    this.ships.push(ship);
  }
  this.hits = [];
  this.addHit = function (hit) {
    this.hits.push(hit);
  }
  this.location = [];
  this.addLocation = function (shiplocation) {
    this.location.push(shiplocation);
  }
}

function ShipLocation(x, y) {
  this.x = x; //row
  this.y = y; //colomn
}

function Ship(size) {
  this.size = size;
  //this.location = location;
}

const myboard = new Board(boardsize);
const opponentboard = new Board(boardsize);

createBoard(myboard, $board1);
createBoard(opponentboard, $board2);

/////////////////////////////////////////////////


var availableShips = [];

for (let i = 1; i <= maxshipsize; i++) {
  for (let j = maxshipsize - i; j >= 0; j--)
    availableShips.push(new Ship(i));
}


function showAvailableShips(availableShips, $ships) {
  for (let i = 0; i < availableShips.length; i++) {
    const $ship = $('<div>').addClass('ship' + availableShips[i].size);
    $ship.attr('draggable', 'true');
    $ship.attr('id', i);
    $ship.attr('ondragstart', 'dragStart(event)');
    $ships.append($ship);
  }
}

showAvailableShips(availableShips, $ships);

function dragStart(ev) {

  ev.dataTransfer.setData('text', ev.target.id);
  shipid = ev.target.id;
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData('text');
  const ship = availableShips[data];
  let $nextcol = $(ev.target);
  var y = $nextcol.index() + 1;
  var x = $nextcol.parent().index() + 1;

  var location = new ShipLocation(x, y);

  if ($('#' + data).hasClass('vertical')) {
    if (validMove2(location, ship.size, true) && validMove($nextcol, ship.size, true)) {
      $nextcol.addClass('shipz');
      for (let i = 1; i < ship.size; i++) {
        var indexchild = $nextcol.index();
        $nextcol = $nextcol.closest('.row').next().children().eq(indexchild);
        $nextcol.addClass('shipz');
      }
      for (let j = 0; j < availableShips[data].size; j++) {
        myboard.addLocation(new ShipLocation(x, y));
        x++;
      }
      myboard.addShip(ship);
      removeShip(shipid);
    }
    else alert('Invalid placement');
  }
  else {
    if (validMove2(location, ship.size, false) && validMove($nextcol, ship.size, false)) {
      $nextcol.addClass('shipz');
      for (let i = 1; i < ship.size; i++) {
        $nextcol = $nextcol.next();
        $nextcol.addClass('shipz');
      }

      for (let j = 0; j < availableShips[data].size; j++) {
        myboard.addLocation(new ShipLocation(x, y));
        y++;
      }
      removeShip(shipid);
      myboard.addShip(ship);
    }
    else alert("Invalid placement");
  }
  if (myboard.ships.length == 10) ready();
}

function allowDrop(ev) {
  ev.preventDefault();
}

function removeShip(ship) {
  $('#' + ship).remove();
}

function resetBoard() {
  $("button").click(function () {
    $('#board1 div').removeClass("shipz");
    for (let i = 1; i <= 4; i++) {
      $('.ship' + i).remove();
    }
    myboard.location = [];
    myboard.ships = [];
    showAvailableShips(availableShips, $ships);
  });
}

resetBoard();

function dropp(ev) {

  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  const ship = availableShips[data];
  const height = ship.size * 35;

  ev.target.appendChild(document.getElementById(data));

  document.getElementById(data).classList.add('vertical');
  document.getElementById(data).style.width = '35px';
  document.getElementById(data).style.height = height + 'px';

}

function ready() {
  //create ready button
  var btn = document.createElement("BUTTON");
  var t = document.createTextNode("READY");
  $(btn).attr('onclick', 'startgame()');    // ready onclick calls setup() function
  btn.appendChild(t);
  document.getElementById("ready").appendChild(btn);
  //remove rotate box, ships 
  $('#ships').remove();
  $('#reset').remove();
  $('#rotate').remove();

  return true;
}

function startgame() {
  $('#ready').remove();
  document.getElementById("turn").innerHTML = "Waiting for another player";
  setup();
}

function allowHit() {
  $board2.on('click', '.col.hidden', function (evt) {
    const $cell = $(evt.target);
    if (($(this).hasClass('miss') == false) && ($(this).hasClass('hit') == false)) {
      opponentboard.addHit(new ShipLocation($cell.parent().index() + 1, $cell.index() + 1));

      var hitship = {
        messageType: "hitmessage",
        data: new ShipLocation($cell.parent().index() + 1, $cell.index() + 1)
      }
      gamestate.sendmsg(JSON.stringify(hitship));
      $board2.off('click');
    }
  });
}

function isHit(hit) {
  let wasHit = false;
  //if hit check if ship destroyed(true/false) and give one more shot chance
  for (let i = 0; i < myboard.location.length; i++) {
    if (myboard.location[i].x == hit.x && myboard.location[i].y == hit.y) {
      $('#board1 .row' + '.' + hit.x + ' ' + '.col.hidden' + '.' + hit.y).addClass('hit');
      wasHit = true;
      myboard.addHit(new ShipLocation(hit.x, hit.y));
    }
    else $('#board1 .row' + '.' + hit.x + ' ' + '.col.hidden' + '.' + hit.y).addClass('miss');
  }
  if (wasHit == false) isMyTurn(true);
  var hitresponse = {
    messageType: 'hitresponse',
    hitx: hit.x,
    hity: hit.y,
    data: wasHit
  };
  var turn = {
    messageType: "yourturn",
    data: wasHit
  }
  gamestate.sendmsg(JSON.stringify(turn));
  gamestate.sendmsg(JSON.stringify(hitresponse));
  if (myboard.hits.length == myboard.location.length) {
    gameOver(false);
    var win = {
      messageType: "win",
      data: true
    }
    gamestate.sendmsg(JSON.stringify(win));
  }
}


function shipDestroyed() {
  //return true if there is no class 'ship' up, down, left or right
}

function gameOver(isWin) {
  isMyTurn(false);
  let message = "";
  if (isWin) {
    message = 'YOU WON!';
  } else {
    message = 'YOU LOST!';
  }
  $("#turn").css("color", "indigo");
  document.getElementById("turn").innerHTML = message;
}

function setup() {
  socket = new WebSocket(Setup.WEB_SOCKET_URL);
  gamestate = new GameState(socket);

  socket.onmessage = function (event) {
    let msg = JSON.parse(event.data);
    //console.log(incomingMsg);
    console.log(msg);

    if (msg.data == 'B') {
      var turn = {
        messageType: "yourturn",
        data: true
      }
      gamestate.sendmsg(JSON.stringify(turn));
      document.getElementById("turn").innerHTML = "Opponent's turn";
    }

    if (msg.messageType === 'yourturn') {
      isMyTurn(msg.data);
    }
    if (msg.messageType === 'hitmessage') {
      isHit(msg.data);
    }
    if (msg.messageType === 'hitresponse') {
      if (msg.data == true) $('#board2 .row' + '.' + msg.hitx + ' ' + '.col.hidden' + '.' + msg.hity).addClass('hit');
      else $('#board2 .row' + '.' + msg.hitx + ' ' + '.col.hidden' + '.' + msg.hity).addClass('miss');
    }
    if (msg.messageType === 'win') {
      gameOver(msg.data);
    }
  }
  socket.onclose = function () {
    document.getElementById("turn").innerHTML = 'Opponent has left the game :(';
  };
  socket.onerror = function () {
  }
}


function GameState(socket) {
  this.socket = socket;
  this.sendmsg = function (message) {
    this.socket.send(message);
  }
}

function isMyTurn(turn) {
  if (turn) {
    document.getElementById("turn").innerHTML = "My turn";
    allowHit();
  }
  else {
    document.getElementById("turn").innerHTML = "Opponent's turn";
    $board2.click(false);
  }
}

var elem = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

var d0 = new Date();

function printTime() {
  var d1 = new Date();
  var s = d1 - d0;
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;

  document.getElementById("timer").innerHTML = 'Time played: ' + mins + ":" + secs;
}
setInterval(printTime, 1000);