import React, { Component } from 'react'
import update from 'react-addons-update'
import Board from './Board'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import 'whatwg-fetch'
import 'babel-polyfill'
import throttle from 'throttle-debounce/throttle'

const API_URL = 'http://kanbanapi.pro-react.com'
const API_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: 'hey hey hey'
}

class BoardContainer extends Component {

  constructor(){
    super(...arguments)
    this.state = {
      cards:[]
    }
  }

  componentDidMount(){
    fetch( `${API_URL}/cards`, {headers:API_HEADERS})
      .then((response)=> response.json())
      .then((responseData)=> {
        this.setState({
          cards: responseData
        })
      })
      .catch( error => {
        console.error('error:', error)
    })
  }

  addCard(card){
    let prevState= this.state

    if(card.id ===  null){
      let card = Object.assign( {}, card, {id:Date.now()})
    }

    let nextState = update(this.state.cards, { $push: [card] })

    this.setState({ cards: nextState })

    fetch(`${API_URL}/cards`, {
      method: 'post',
      headers: API_HEADERS,
      body: JSON.stringify(card)
    })
    .then( (response)=> {
      if(response.ok){
        return response.json()
      } else {
        throw new Error('server was not oK')
      }
    })
    .then( (responseData)=> {
      card.id = responseData.id
      this.setState=(prevState)
    })
  }

  updateCard(card){
    let prevState = this.state

    let cardIndex = this.state.cards.findIndex( (c) => c.id == card.id)

    let nextState = update(
        this.state.cards, {
          [cardIndex] : { $set: card }
    })

    this.setState = ({cards: nextState})

    fetch(`${API_URL}/cards/${card.id}`, {
      method: 'put',
      headers: API_HEADERS,
      body: JSON.stringify(card)
    })
    .then( (response) => {
      if(!response.ok){
        throw new Error('server response was not ok')
      }
    })
    .catch( (error)=> {
      console.error('fetch error:', error)
      this.setState(prevState)
    })
  }

  addTask(cardId, taskName){
    let prevState = this.state

    let cardIndex = this.state.cards.findIndex((card)=> card.id == cardId)

    let newTask = {id:Date.now(), name:taskName, done:false}

    let nextState = update(this.state.cards, {
      [cardIndex]: {
        tasks: {$push: [newTask]}
      }
    })

    this.setState({ cards:nextState })

    fetch(`${API_URL}/cards/${cardId}/tasks`, {
      method: 'post',
      headers: API_HEADERS,
      body: JSON.stringify(newTask)
    })
    .then((response)=> {
      if(response.ok){
        return response.json()
      } else {
        //throw an error
        throw new Error('server response was not ok')
      }
    })
    .then( (responseData) => {
      newTask.id = responseData.id
      this.setState({ cards: nextState })
    })
    .catch( (error) => {
      this.setState(prevState)
    })
  }

  deleteTask(cardId, taskId, taskIndex){
    let cardIndex = this.state.cards.findIndex((card) => card.id == cardId)

    let prevState = this.state

    let nextState = update(this.state.cards, {
      [cardIndex] : {
        tasks: {$splice: [[taskIndex, 1]]}
      }
    })

    this.setState({ cards: nextState })

    fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`, {
      method: 'delete',
      headers: API_HEADERS
    })
    .then( (response)=> {
      if(!response.ok){
        throw new Error('server response was not ok')
      }
    })
    .catch( (error)=> {
      console.error('fetch error:', error)
      this.setState(prevState)
    })
  }

  toggleTask(cardId, taskId, taskIndex){

    let prevState = this.state

    let cardIndex = this.state.cards.findIndex((card)=> card.id == cardId)

    let newDoneValue

    let nextState = update(this.state.cards, {
        [cardIndex] : {
            tasks: {
              done: { $apply: (done) => {
                newDoneValue = !done
                return newDoneValue
            }
          }
        }
      }
    })
    // set the component state to the mutated object

    this.setState({ cards: nextState })
    // Call the API to toggle the task on the server
    fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`, {
      method: 'put',
      headers: API_HEADERS,
      body: JSON.stringify({ done: newDoneValue })
    })
    .then( (response) => {
      if(!response.ok){
        throw new Error('server response was not ok')
      }
    })
    .catch((error) => {
      console.error('fetch error:', error)
      this.setState(prevState)
    })

  }

  updateCardStatus(cardId, listId){
    let cardIndex = this.state.cards.findIndex( (card)=> card.id == cardId)

    let card = this.state.cards[cardIndex]

    if(card.status !== listId){
      this.setState(update(this.state, {
        cards: {
          [cardIndex] : {
            status: { $set: listId }
          }
        }
      }))
    }
  }

  updateCardPosition(cardId, afterId){
    if(cardId !== afterId){
      let cardIndex = this.state.cards.findIndex( (card)=> card.id == cardId)

      let card = this.state.cards[cardIndex]

      let afterIndex = this.state.cards.findIndex( (card)=> card.id == afterId )

      this.setState(update(this.state), {
        cards: {
          $splice: [
            [cardIndex, 1],
            [afterIndex, 0, card]
          ]
        }
      })
    }
  }

  persistCardDrag(cardId, afterId ){
    let cardIndex = this.state.cards.findIndex( (card) => card.id == cardId)

    let card = this.state.cards[cardIndex]

    fetch(`${API_URL}/cards/${cardId}`, {
      method: 'put',
      headers: API_HEADERS,
      body: JSON.stringify({status: card.status, row_order_position: cardIndex })
    })
    .then( (response)=> {
      if(!response.ok){
        throw new Error('Server response was not ok')
      }
    })
    .catch( (error)=> {
      console.error('fetch error:', error)
      this.setState(
        update(this.state, {
          cards: {
            [cardIndex]:{
              status: { $set: status }
            }
          }
        })
      )
    })
  }

  render(){
    let Board = this.props.children && React.cloneElement(this.props.children, {
      cards: this.state.cards,
      taskCallbacks: {
        toggle: this.toggleTask.bind(this),
        delete: this.deleteTask.bind(this),
        add: this.addTask.bind(this)
      },

      cardCallbacks: {
        addCard: this.addCard.bind(this),
        updateCard: this.updateCard.bind(this),
        updateStatus: this.updateCardStatus.bind(this),
        updatePosition: throttle(this.updateCardPosition.bind(this), 500),
        // persistMove: this.persistCardMove.bind(this)
      }
    })
    return Board
  }
}

export default DragDropContext(HTML5Backend)(BoardContainer)