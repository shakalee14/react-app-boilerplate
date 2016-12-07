import React, { Component, PropTypes } from 'react'
import Card from './Card'

class List extends Component {
  render(){
    let cards = this.props.cards.map((card) =>
      <Card key={card.id}
         taskCallbacks={this.props.taskCallbacks}
         title={card.title}
         id={card.id}
         description={card.description}
         tasks={card.tasks}
         color={card.color}
         />
    )
      return (
        <div className= 'list'>
          <h1> {this.props.title} </h1>
          {cards}
        </div>
      )
  };

}

List.propTypes={
  title: PropTypes.string.isRequired,
  cards: PropTypes.arrayOf(PropTypes.object),
  taskCallbacks: PropTypes.object
}
export default List