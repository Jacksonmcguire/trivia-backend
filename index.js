const GameManager = require('./gameManager')
const utils = require('./utils')
const app = require('express')
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
  cors: {
    origin: "https://trivia-fanatics.herokuapp.com",
  }
})
let manager = new GameManager()


io.on('connection', socket => {

  socket.on('create game', ({room, name}) => {
    socket.join(room)
    if (!utils.getGame(manager, room)) {
      manager.newGame(room, {id: socket.id, name})
      io.to(room).emit('new game', {room, host: socket.id})
    } else {
      io.emit('duplicate room', {room, id: socket.id})
    }
  })

  socket.on('submit slides', ({slideDeck, room}) => {
    let game = utils.getGameIndex(manager, room)
    manager.games[game].setSlides(slideDeck)

    io.emit('add game', manager)
  })

  socket.on('join game', ({room, name}) => {
    if (utils.getGame(manager, room)) {
      socket.join(room)
      let game = utils.getGameIndex(manager, room)
      game > -1 && manager.games[game].playerJoin({name, id: socket.id})

      io.to(room).emit('new player',
        { slides: manager.games[game].slideDeck, manager, room})
      io.to(room).emit('new message',
        { name: 'Bot', message: name + ' Has joined the game' })
    } else {
      io.emit('failed join', {room, id: socket.id})
    }
  })
  
  socket.on('leaving player', (room) => {
    let game = utils.getGameIndex(manager, room)
    let name = game > -1 && manager.games[game].players.find(player =>
      player.id === socket.id).name

    game > -1 && manager.games[game].playerLeave(socket.id)
    socket.leave(room)
    
    io.to(room).emit('update score', {manager, room})

    name && io.to(game.room).emit('new message',
      { name: 'Bot', message: name + ' Has left the game' })

  })

  socket.on('correct answer', (room) => {
    let game = utils.getGameIndex(manager, room)
    manager.games[game].answerQuestion(socket.id, true)
    io.to(room).emit('update score', {manager, room})
  })

  socket.on('wrong answer', (room) => {
    let game = utils.getGameIndex(manager, room)
    manager.games[game].answerQuestion(socket.id, false)
    io.to(room).emit('update score', {manager, room})
  })

  socket.on('next question', (room) => {
    let game = utils.getGameIndex(manager, room)
    game > -1 && manager.games[game].nextQuestion()
    
    io.to(room).emit('advance question', manager.games[game])
  })

  socket.on('message', ({message, id, room}) => {
    let game = utils.getGameIndex(manager, room)
    if (game > -1) {
      let player = manager.games[game].players.find(player => player.id === id)
      if (player) {
        manager.games[game].logChat({name: player.name, message})
        io.to(room).emit('new message', {name: player.name, message})
      } else if (manager.games[game].host.id === id) {
        utils.sendMessage(manager, io, game, message)
      }
    }
  })

  socket.on('new round', ({room, slides}) => {
    let game = utils.getGameIndex(manager, room)
    game > -1 && manager.games[game].newRound(slides)
    io.to(room).emit('starting new round', manager.games[game].slideDeck)

  })

  socket.on('end game', (room) => {
    io.to(room).emit('game ending')
    manager.endGame(room)
  })

  socket.on('disconnecting', () => {
    const game = manager.games.find(game => game.host.id === socket.id)
    if (game) {
      io.to(game.room).emit('game ending')
      manager.endGame(game.room); 
    } else {
      const game = manager.games.find(game => 
        game.players.find(player => player.id === socket.id))    
      if (game) {
        let name = game.players.find(player => player.id === socket.id).name

        manager.games[manager.games.indexOf(game)].playerLeave(socket.id)
        io.to(game.room).emit('update score', {manager, room: game.room})
        name && io.to(game.room).emit('new message',
          { name: 'Bot', message: name + ' Has left the game' })
      }
    }
  })

})

http.listen(process.env.PORT || 4000, () => console.log('port 4000'))

