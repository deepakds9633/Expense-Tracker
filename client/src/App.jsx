import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar      from './components/Navbar'
import Dashboard   from './pages/Dashboard'
import AddTransaction from './pages/AddTransaction'
import History     from './pages/History'
import Accounts    from './pages/Accounts'
import Login       from './pages/Login'
import Register    from './pages/Register'

// Shows spinner while we verify token on first load
function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  )
}

// Redirect unauthenticated users to /login
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/login" replace />
}

// Redirect already-logged-in users away from auth pages
function AuthRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? <Navigate to="/" replace /> : children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <>
      <Routes>
        {/* Auth pages — no Navbar */}
        <Route path="/login"    element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

        {/* Protected pages — with Navbar */}
        <Route path="/"         element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/add"      element={<PrivateRoute><AddTransaction /></PrivateRoute>} />
        <Route path="/history"  element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="/accounts" element={<PrivateRoute><Accounts /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Show Navbar only when logged in */}
      {user && <Navbar />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
