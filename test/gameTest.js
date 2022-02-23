const expect = require('chai').expect;
const GameManager = require('../gameManager')

describe('Game Test', () => {

  let gameManager = new GameManager()

  describe('Game Manager methods', () => {

    it('Should be able to start a new game', () => {
      expect(gameManager.games).to.have.lengthOf(0)
      gameManager.newGame('jax', 'room')
      expect(gameManager.games).to.have.lengthOf(1)
    })
    
    it('Should be able to end a game', () => {
      expect(gameManager.games).to.have.lengthOf(1)
      gameManager.endGame('room')
      expect(gameManager.games).to.have.lengthOf(0)
    })

  })
  
  describe('Game methods', () => {

    it('Should allow a user to join a game', () => {
      gameManager.newGame('jackson', 'testRoom')
      expect(gameManager.games[0].players).to.have.lengthOf(0)
      gameManager.games[0].playerJoin({name: 'testUser', id: 0})
      expect(gameManager.games[0].players[0]).to.deep.be.equal(
        { name: 'testUser', incorrect: 0, correct: 0, id: 0 })
    })

    it('Should allow a user to leave a game', () => {
      expect(gameManager.games[0].players).to.have.lengthOf(1)
      gameManager.games[0].playerLeave(0)
      expect(gameManager.games[0].players).to.have.lengthOf(0)
    })

    it('Should allow a user to answer a question correctly', () => {
      gameManager.games[0].playerJoin({name: 'testUser', id: 0})
      expect(gameManager.games[0].players[0]).to.deep.be.equal(
        { name: 'testUser', incorrect: 0, correct: 0, id: 0 })
      gameManager.games[0].answerQuestion(0, true)
      expect(gameManager.games[0].players[0]).to.deep.be.equal(
        { name: 'testUser', incorrect: 0, correct: 1, id: 0 })
    })

    it('Should allow a user to answer a question incorrectly', () => {
      gameManager.games[0].playerJoin({name: 'testUser', id: 0})
      expect(gameManager.games[0].players[0]).to.deep.be.equal(
        { name: 'testUser', incorrect: 0, correct: 1, id: 0 })
      gameManager.games[0].answerQuestion(0, false)
      expect(gameManager.games[0].players[0]).to.deep.be.equal(
        { name: 'testUser', incorrect: 1, correct: 1, id: 0 })
    })

    it('Should be able to set a deck of slides', () => {
      expect(gameManager.games[0].slideDeck).to.have.lengthOf(0)
      gameManager.games[0].setSlides([{title: "New Slides"}])
      expect(gameManager.games[0].slideDeck).to.have.lengthOf(1)
    })

    it('Should allow a user to update the chat log', () => {
      expect(gameManager.games[0].chat).to.have.lengthOf(0)
      gameManager.games[0].logChat("Jackson: Hello")
      expect(gameManager.games[0].chat).to.have.lengthOf(1)
    })

    it('Should allow the game manager to move onto the next questions', () => {
      expect(gameManager.games[0].currentQ).to.deep.eq(0)
      gameManager.games[0].nextQuestion()
      expect(gameManager.games[0].currentQ).to.deep.eq(1)
    })

    it('Should allow the game manager to start a new round', () => {
      expect(gameManager.games[0].slideDeck).to.have.lengthOf(1)
      gameManager.games[0].newRound([{question: "What's the Scenario"}])
      expect(gameManager.games[0].slideDeck).to.have.lengthOf(2)
    })
  })
})