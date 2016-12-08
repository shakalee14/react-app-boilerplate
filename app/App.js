import React from 'react';
import {render} from 'react-dom';
import { Router, Route, browserHistory } from 'react-router'
import 'history'
import BoardContainer from './BoardContainer'
import Board from './Board'
import EditCard from './EditCard.js'
import NewCard from './NewCard.js'

render((
  <Router history={browserHistory}>
    <Route component={BoardContainer}>
      <Route path="/" component={Board}>
        <Route path="new" component={NewCard} />
        <Route path="edit/:card_id" component={EditCard} />
      </Route>
    </Route>
  </Router>
), document.getElementById('root'))
