import React, { useState, useEffect, useContext } from 'react'
import { SignIn } from './components/SignIn'
import { CurrentUser } from './components/CurrentUser'
import { auth } from './firebase'
import { database } from './firebase'
import pick from 'lodash/pick'
import { FindGame } from './components/FindGame'
import { GameDesk } from './components/GameDesk'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import routes, { routesMap } from './router'
import { UserState } from './context/user/UserState'

export const App = () => {
  let userRef = null;
  const [card, setCard] = useState(36)
  const [haveCard, setHaveCard] = useState([]);
  const [desk, setDesk] = useState([])
  const [games, setGames] = useState([])
  const suit = ['worms', 'bubi', 'cross', 'peaks'];
  const cardObject = [
    { name: 'Шесть', points: 6, coords: [0, 1], suit },
    { name: 'Семь', points: 7, coords: [1, 1], suit },
    { name: 'Восемь', points: 8, coords: [2, 1], suit },
    { name: 'Девять', points: 9, coords: [3, 1], suit },
    { name: 'Десять', points: 10, coords: [4, 1], suit },
    { name: 'Валет', points: 2, coords: [0, 2], suit },
    { name: 'Дама', points: 3, coords: [1, 2], suit },
    { name: 'Король', points: 4, coords: [2, 2], suit },
    { name: 'Туз', points: 11, coords: [0, 0], suit }
  ]

  // Создает калоду из 36 карт с разными масятми по порядку
  function deck() {
    let card = []
    card = cardObject.map(item => {
      let { name, points, coords } = item
      return item.suit.map(suit => ({ name, points, coords, suit }))
    })
    shuffleСards(card.flat(Infinity))
  }
  // Перемешивает колоду на половину длины колоды
  function shuffleСards(deck) {
    let shuffleCount = Math.floor(deck.length / 2);
    while (shuffleCount > 0) {
      let [pulledOutCard] = deck.splice(Math.floor(Math.random() * deck.length - 1), 1)
      deck.splice(Math.floor(Math.random() * deck.length - 1), 0, pulledOutCard)
      shuffleCount--;
    }
    setDesk(deck)
    // dealCards(deck, 4)
  }
  /**
  * Вывод карт на стол
  *
  * @param {array} card Принимает массив который нужно вынести 
  *
  * @return {JSX}
  */
  function paintCard(card) {
    let [x, y] = card.coords;
    return (<div className={"card " + card.suit}
      style={
        { backgroundPosition: `${x * -204}px ${y * -266}px` }
      } />)
  }
  /**
   * Раздает карты из колоды удаляя карту в самой колоде
   *
   * @param {object} card Принимает массив карт
   * @param {number} count Число карт сколько нужно выдать игроку
   * 
   */
  function dealCards(deck, count) {
    let deckCopy = [...deck];
    let haveCardCopy = [...haveCard]
    while (count > 0) {
      haveCardCopy.push(deckCopy.shift())
      count--;
    }
    setDesk(deckCopy)
    setHaveCard(haveCardCopy)
  }

  return (
    <UserState>
      <Router>
        <>
          <ul>
            <li><Link to={routesMap.home}>Главная</Link></li>
            <li><Link to={routesMap.about}>Об игре</Link></li>
            <li><Link to={routesMap.game}>Список игр</Link></li>
          </ul>
          <button onClick={deck}>Запустить</button>
          <button onClick={() => dealCards(desk, 1)}>Взять 1 карту</button>
          {/* <FindGame user={user} desk={desk} /> */}
          {desk.map(paintCard)}
          <hr />
          {haveCard.map(paintCard)}
          {<SignIn />}
          {/* {<CurrentUser/>} */}
          <Switch>
            {routes.map((route) => {
              return <Route path={route.url}
                component={route.component}
                exact={route.exact}
                key={route.url}
              />;
            })}
          </Switch>
        </>
      </Router>
    </UserState>
  )
}