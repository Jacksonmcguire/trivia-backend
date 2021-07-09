module.exports = class Game {
  constructor(host, room) {
    this.host = host;
    this.room = room;
    this.slideDeck = [];
    this.players = [];
    this.chat = [];
  }

  playerJoin({name, id}) {
    if (!this.players.find(player => player.id === id)) {
      
      this.players.push({name, incorrect: 0, correct: 0, id})
    }
  }

  playerLeave(id) {
    const index = this.players.findIndex(player => player.id === id)
    this.players.splice(index, 1)
  }

  answerQuestion(id, accuracy) {
    let player = this.players.find(player => player.id === id)
    if (player !== undefined) accuracy ? player.correct ++ : player.incorrect ++;
  }

  setSlides(slides) {
    this.slideDeck = slides
  }

  logChat(chat) {
    this.chat.push(chat)
  }

}