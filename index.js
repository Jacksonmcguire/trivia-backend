const GameManager = require('./gameManager')
const app = require('express')
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
  }
})
let manager = new GameManager()


io.on('connection', socket => {

  socket.on('create game', (roomName) => {
    socket.join(roomName)
    if (!manager.games.find(game => game.room === roomName)) {
      manager.newGame(roomName, socket.id)
      io.to(roomName).emit('new game', {room: roomName, host: socket.id})
    } else io.emit('duplicate room', {room: roomName, id: socket.id})
  })

  socket.on('submit slides', ({slideDeck, room}) => {
    let game = manager.games.findIndex(game => game.room === room)
    manager.games[game].setSlides(slideDeck)
    io.emit('add game', manager)

  })

  socket.on('join game', ({room, name}) => {
    if (manager.games.find(game => game.room === room)) {
      socket.join(room)
      let game = manager.games.findIndex(game => game.room === room)
      game > -1 && manager.games[game].playerJoin({name: name, id: socket.id})
      io.to(room).emit('new player', { slides: manager.games[game].slideDeck, manager: manager, room: room})
    } else io.emit('failed join', {room: room, id: socket.id})
  })
  
  socket.on('leaving player', (room) => {
    let game = manager.games.findIndex(game => game.room === room)
    game > -1 && manager.games[game].playerLeave(socket.id)
    socket.leave(room)
    io.to(room).emit('update score', {manager: manager, room: room})
  })

  socket.on('correct answer', (room) => {
    let game = manager.games.findIndex(game => game.room === room)    
    manager.games[game].answerQuestion(socket.id, true)
    io.to(room).emit('update score', {manager: manager, room: room})
  })

  socket.on('wrong answer', (room) => {
    let game = manager.games.findIndex(game => game.room === room)
    manager.games[game].answerQuestion(socket.id, false)
    io.to(room).emit('update score', {manager: manager, room: room})
  })

  socket.on('message', ({message, id, room}) => {
    let game = manager.games.findIndex(game => game.room === room)
    if (game > -1) {
      let player = manager.games[game].players.find(player => player.id === id)
      if (player) {
        manager.games[game].logChat({name: player.name, message: message})
        io.to(room).emit('new message', {name: player.name, message: message})
      } else if (manager.games[game].host === id){
        manager.games[game].logChat({name: 'Host', message: message})
        io.to(room).emit('new message', {name: 'Host', message: message})
      }
    }
  })
})

http.listen(process.env.PORT|| 4000, () => console.log('listening on port 4000'))

