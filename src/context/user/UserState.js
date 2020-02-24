import React, { useReducer, useEffect } from 'react'
import { UserContext } from './UserContext'
import UserReducer from './UserReducer'
import { auth, database } from '../../firebase'
import pick from 'lodash/pick'

export const UserState = ({ children }) => {
  let refs = {
    userRef: null
  };
  const [state, dispatch] = useReducer(UserReducer, {})

  useEffect(() => {
    auth.onAuthStateChanged(user => {
      if (user) {
        dispatch({ type: 'USER_SET', user });
        refs.userRef = database.ref('/user');
        refs.userRef = refs.userRef.child(user.uid)
        refs.userRef.once('value')
          .then(snapshot => {
            if (snapshot.val()) return;
            const userData = pick(user, ['displayName', 'photoURL', 'email'])
          })
      }
    });
  }, [])
  return <UserContext.Provider
    value={{ ...state }}
  >
    {children}
  </UserContext.Provider>
}