import { useState } from 'react'
import { AuthContextProvider } from './context/AuthContext'
import { AppContext, AppContextProvider } from './context/AppContext'
import AppRoutes from './routes/routes'

function App() {
  return (
    <AuthContextProvider>
      <AppContextProvider>
        <AppRoutes/>
      </AppContextProvider>
    </AuthContextProvider>
  )
}

export default App
