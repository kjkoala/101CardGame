import React from 'react'
import { database } from '../firebase'


export const FindGame = ({user, desk}) => {
  const gameRef = database.ref('/games')
  function createGame() {
    gameRef.push({
      name: 'ЛОЛ',
      userLength: 4,
      creator: user.uid,
      deck: desk
    })
  }
  return (
    <>
      <button onClick={createGame}>Создать игру</button>
      <button>Найти игру</button>
    </>
  )
}