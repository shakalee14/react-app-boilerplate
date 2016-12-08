import React, { Component, PropTypes } from 'react'
import CardForm from './CardForm'
import { browserHistory } from 'react-router'
import 'history'

class NewCard extends Component {

  componentWillMount() {
    this.setState({
      id: Date.now(),
      title: '',
      description: '',
      status: 'todo',
      color: '#c9c9c9',
      tasks: []
    })
  }

  handleChange(field, value){
    this.setState({[field]: value})
  }

  handleSubmit(event){
    event.preventDefault()
    this.props.cardCallbacks.addCard(this.state)
    window.history.push(null, '/')
  }

  handleClose(event){
    window.history.push(null, '/')
  }

  render(){
    return(
      <CardForm draftCard={this.state}
                buttonLabel="create card"
                handleChange={this.handleChange.bind(this)}
                handleSubmit={this.handleSubmit.bind(this)}
                handleClose={this.handleClose.bind(this)} />
    )
  }
}

NewCard.propTypes = {
  cardCallbacks: PropTypes.object
}

export default NewCard