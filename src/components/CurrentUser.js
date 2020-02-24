import React from 'react'

export const CurrentUser = ({ user }) => {
  return (
    <div>Добро пожаловать, {user.displayName}</div>
  )
}