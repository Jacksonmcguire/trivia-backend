const Game = require("./game");

module.exports = class GameManager {
  constructor () {
    this.games = [];
  }

  newGame(room, host) {
    this.games.push(new Game(host, room))
  }

  endGame(room) {
    const index = this.games.findIndex(game => game.room === room)
    this.games.splice(index, 1)
  }

}