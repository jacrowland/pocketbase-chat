import { AuthContextProvider } from './context/AuthContext'
import { AppContextProvider } from './context/AppContext'
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
