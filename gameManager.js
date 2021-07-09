const Game = require("./game");

module.exports = class GameManager {
  constructor () {
    this.games = [];
  }

  newGame(room, host) {
    this.games.push(new Game(host, room))
  }



}