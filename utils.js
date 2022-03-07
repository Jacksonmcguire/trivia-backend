

module.exports = {
  getGame: (manager, room) => {
    return manager.games.find(game => game.room === room)
  },
  getGameIndex: (manager, room) => {
    return manager.games.findIndex(game => game.room === room)
  },
  sendMessage: (manager, io, game, message) => {
    
    manager.games[game].logChat(
      { name: manager.games[game].host.name, message })
        
    io.to(manager.games[game].room).emit('new message',
      { name: manager.games[game].host.name, message })
  }
}