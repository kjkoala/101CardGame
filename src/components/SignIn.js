import React from 'react'
import { auth, googleAuthProvider } from '../firebase'

export const SignIn = () =>
  (<div className="auth">
    <button onClick={() => auth.signInWithPopup(googleAuthProvider)}>Авторизоваться с помощью Google</button>
  </div>)