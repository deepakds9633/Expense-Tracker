import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider }         from './context/ThemeContext'
import Navbar        from './components/Navbar'
import Dashboard     from './pages/Dashboard'
import AddTransaction from './pages/AddTransaction'
import History       from './pages/History'
import Accounts      from './pages/Accounts'
import Login         from './pages/Login'
import Register      from './pages/Register'

function LoadingScreen() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="spinner"/>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen/>
  return user ? children : <Navigate to="/login" replace/>
}

function AuthRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen/>
  return user ? <Navigate to="/" replace/> : children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <>
      <Routes>
        <Route path="/login"    element={<AuthRoute><Login/></AuthRoute>}/>
        <Route path="/register" element={<AuthRoute><Register/></AuthRoute>}/>
        <Route path="/"         element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
        <Route path="/add"      element={<PrivateRoute><AddTransaction/></PrivateRoute>}/>
        <Route path="/history"  element={<PrivateRoute><History/></PrivateRoute>}/>
        <Route path="/accounts" element={<PrivateRoute><Accounts/></PrivateRoute>}/>
        <Route path="*"         element={<Navigate to="/" replace/>}/>
      </Routes>
      {user && <Navbar/>}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes/>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
