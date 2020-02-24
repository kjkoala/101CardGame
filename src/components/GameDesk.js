import React, { useEffect, useState } from 'react'
import { database } from '../firebase'
import { Link } from 'react-router-dom'
import { urlBuilder } from '../router'


export const GameDesk = () => {
    const gamesRef = database.ref('/games');

    const [games, setGames] = useState([])


    useEffect(() => {
        gamesRef.on('value', snapshot => {
            setGames(snapshot.val())
        })
    }, []);
    let gamesMap = Object.entries(games) || [];
    return (<>
        {games && <div>
           { gamesMap.map(game => {
               return (
                <Link to={urlBuilder('desk', {id: game[0]})}>
                        Название игры: {game[1].name}
                        Кол-во игроков: {game[1].userLength}
                    </Link>
                    )
           })}
    </div>}
    </>)
}