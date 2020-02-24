import React, { useEffect, useContext, useState } from 'react'
import { database } from '../../firebase'
import { UserContext } from '../../context/user/UserContext'

export const Desk = ({ match }) => {
    const [gamesData, setGamesData] = useState(null)
    const { user } = useContext(UserContext)
    const gameRef = database.ref('/games')
    useEffect(() => {
        if (user) {
            gameRef.child(match.params.id).child('players').child(user.uid).set({ name: user.displayName});
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
            return {copyPlayerDeck, copyGameDeck}
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
       let newDeck =  dealCards('', 4 * playersLength, false)
        // gameRef.child(match.params.id).child('deck').set(dealCards('', 4 * playersLength, false))
        setGamesData(prevState => {
            let i = 0;
            for(let uid in prevState.players) {
                prevState.players[uid].deck = playerDeck[i]
                gameRef.child(match.params.id).child('players').child(uid).set({...prevState.players[uid], deck: playerDeck[i]})
                i++;
            }
            return {
                ...prevState,
                deck: newDeck,
                players: prevState.players
            }
        })
        // gameRef.child(match.params.id).child('players').child
    }

    function paintCard(card) {
        let [x, y] = card.coords;
        return (<div className={"card " + card.suit}
          style={
            { backgroundPosition: `${x * -204}px ${y * -266}px` }
          } />)
      }
    return (
        <>
            <h1>Страница игры</h1>
            {gamesData && <span>Игроков на странице: {Object.values(gamesData.players).length}</span>}
            {gamesData && <span>Комната на {gamesData.userLength} игрока</span>}
            {gamesData && Object.values(gamesData.players).length == gamesData.userLength && user.uid === gamesData.creator &&
                <button onClick={startGame}>Раздать карты</button>}
            {gamesData && Array.isArray(gamesData.players[user.uid].deck) && gamesData.players[user.uid].deck.map(paintCard)}
        </>
    )
}