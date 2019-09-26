"use strict";

// Express & Socket.io deps
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const _ = require('lodash');

const Player = require('./player');
const puerto = 3000;

// ID para que sea incrementable
let autoId = 0;
// Tam grilla
const GRID_SIZE = 40;

let players = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(puerto, () => {
  console.log('En el puerto  *:'+puerto);
});

/*
 * Lleguen al jueguillo
 */
io.on('connection', (client) => {
  let player;
  let id;

  client.on('auth', (opts, cb) => {
    // Iniciar al nuevo jugador, al momento de validar una nueva conexion
    id = ++autoId;
    player = new Player(_.assign({
      id,
      dir: 'right',
      gridSize: GRID_SIZE,
      players: players
    }, opts));
    players.push(player);
    // Callback con id
    cb({ id: autoId });
  });

  client.on('key', (key) => {
    if(player) {
      player.changeDirection(key);
    }
  });

  // Remove players on disconnect
  client.on('disconnect', () => {
    _.remove(players, player);
  });
});


// Main
setInterval(() => {
  players.forEach((p) => {
    p.move();
    p._addTail();
  });
  io.emit('state', {
    players: players.map((p) => ({
      x: p.x,
      y: p.y ,
      id: p.id,
      nickname: p.nickname,
      points: p.points,
      tail: p.tail
    }))

  });
}, 100);
