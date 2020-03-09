import React, { useEffect, useContext, useState } from 'react'
import { database } from '../../firebase'
import { UserContext } from '../../context/user/UserContext'

export const Desk = ({ match }) => {
  const [gamesData, setGamesData] = useState(null)
  const [cardTable, setCardTable] = useState([])
  const { user } = useContext(UserContext)
  const gameRef = database.ref('/games')
  useEffect(() => {
    if (user) {
      gameRef.child(match.params.id).child('players').child(user.uid).set({ name: user.displayName });
      gameRef.child(match.params.id).on('value', snapshot => {
        setGamesData(snapshot.val())
      })
      return () => {
        gameRef.child(match.params.id).child('players').child(user.uid).remove()
      }
    }
  }, [])

  function dealCards(uid, count, changeDeck = true) {
    let playerDeck = [];
    let copyGameDeck = [...gamesData.deck];
    if (Array.isArray(count)) {
      for (let i = 0; i < count.length; i++) {
        playerDeck.push(copyGameDeck[count[i]])
      }

      return playerDeck;
    }
    let copyPlayerDeck = uid ? [...gamesData.players[uid].deck] : [];
    while (count > 0) {
      copyPlayerDeck.push(copyGameDeck.shift())
      count--;
    }
    if (changeDeck) {
      return { copyPlayerDeck, copyGameDeck }
    }
    return copyGameDeck
  }
  // Функция начала игры
  function startGame() {
    let players = { ...gamesData.players }
    let playersLength = Object.values(players).length
    let decks = [];
    let playerDeck = [];

    // Цикл для раздачи карт игрокам в начале
    for (let i = 0; i < playersLength; i++) {
      decks.push([])
      let prevCount = i;

      // Цикл добавляет в массив ид карт из массива колоды
      for (let j = 0; j < 4; j++) {
        decks[i].push(prevCount)
        prevCount = prevCount + playersLength
      }
    }

    // Цикл заменять массив цифр на массив карт из колоды
    for (let k = 0; k < decks.length; k++) {
      playerDeck.push(dealCards('', decks[k]))
    }

    // Удалить карты из колоды которые были добавлены игрокам
    let newDeck = dealCards('', 4 * playersLength, false)
    // gameRef.child(match.params.id).child('deck').set(dealCards('', 4 * playersLength, false))
    setGamesData(prevState => {
      let i = 0;
      for (let uid in prevState.players) {
        prevState.players[uid].deck = playerDeck[i]
        gameRef.child(match.params.id).child('players').child(uid).set({ ...prevState.players[uid], deck: playerDeck[i] })
        i++;
      }
      gameRef.child(match.params.id).child('playerMove').set(userMove())
      gameRef.child(match.params.id).child('cardTable').set(prevState.players[user.uid].deck.splice(-1, 1)) // Удаляет последнюю карту из игрока раздающего.
      gameRef.child(match.params.id).child('players').child(user.uid).child('deck').set(prevState.players[user.uid].deck) // Устанавливает раздающему игроку новою деку минус 1 карта.
      return {
        ...prevState,
        deck: newDeck,
        players: prevState.players,
      }
    })
    // gameRef.child(match.params.id).child('players').child
  }

  // Устанавливает ход следующему игроку
  const userMove = (num = 1) => {
    let rev = Object.keys(gamesData.players).reverse(), id;
    rev.filter((x, i) => {
      if (x.includes(user.uid)) id = i;
    })
    id = (rev.length - 1) >= (id + num) ? id + num : 0;
    return rev[id];
  }

  // Игрок делает ход
  const cardMove = (card) => {
    if (gamesData.playerMove === user.uid) {
      let lastCard = gamesData.cardTable[gamesData.cardTable.length - 1]
      if (card.suit === lastCard.suit || card.points === lastCard.points) {
        // let copyCard = [...cardTable]
        let copyCard = [...gamesData.cardTable]
        copyCard.push(card)
        // setCardTable(copyCard)
        console.log(cardTable)
        let copyDeck = gamesData.players[user.uid].deck.filter(c => c.points !== card.points || c.suit !== card.suit)
        gameRef.child(match.params.id).child('cardTable').set(copyCard) // Карты который отиграны
        gameRef.child(match.params.id).child('players').child(user.uid).child('deck').set(copyDeck) // Удаляем карту которой был сделан ход
        if (card.points !== 6) {
          gameRef.child(match.params.id).child('playerMove').set(userMove()) // Устанавливает какой игрок сейчас ходит
        }
        if (card.points === 7 || (card.points === 4 && card.suit === 'peaks')) {
          let { copyGameDeck, copyPlayerDeck } = dealCards(userMove(), 2)
          gameRef.child(match.params.id).child('players').child(userMove()).set({...gamesData.players[userMove()],deck: copyPlayerDeck}) // Установить игроку взять 2 карты
          gameRef.child(match.params.id).child('playerMove').set(userMove(2))
        }
      } else {
        alert('Этой ходить нельзя!')
      }
    }
  }

  // Функция для клика, дает игроку карту
  const takeCard = () => {
    let { copyGameDeck, copyPlayerDeck } = dealCards(user.uid, 1);
    gameRef.child(match.params.id).child('players').child(user.uid).child('deck').set(copyPlayerDeck)
  }

  function paintCard(card) {
    let [x, y] = card.coords;
    return (<div key={card.point+''+card.suit} className={"card " + card.suit}
      style={
        { backgroundPosition: `${x * -204}px ${y * -266}px` }
      }
      onClick={() => cardMove(card)}
    />)
  }
  return (
    <>
      <h1>Страница игры</h1>
      {gamesData && <span>Игроков на странице: {Object.values(gamesData.players).length}</span>}
      {gamesData && <span>Комната на {gamesData.userLength} игрока</span>}
      {gamesData && Object.values(gamesData.players).length == gamesData.userLength && user.uid === gamesData.creator &&
        <button onClick={startGame}>Раздать карты</button>}
      <br />
      {gamesData && gamesData.playerMove && gamesData.playerMove === user.uid && <button onClick={takeCard}>Взять карту</button>}
      <br />
      {gamesData && gamesData.cardTable && paintCard(gamesData.cardTable[gamesData.cardTable.length - 1])}
      <br />
      {gamesData && Array.isArray(gamesData.players[user.uid].deck) && gamesData.players[user.uid].deck.map(paintCard)}
    </>
  )
}