import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginApi } from '../api/api'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const validate = () => {
    if (!email.trim())    return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
    if (!password)        return 'Password is required.'
    if (password.length < 6) return 'Password must be at least 6 characters.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    try {
      const { data } = await loginApi({ email: email.trim().toLowerCase(), password })
      login({ _id: data._id, name: data.name, email: data.email }, data.token)
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Logo / Brand */}
      <div className="auth-brand">
        <div className="auth-logo">💰</div>
        <h1 className="auth-title">My Money</h1>
        <p className="auth-subtitle">Track every rupee. Stay in control.</p>
      </div>

      {/* Card */}
      <div className="auth-card">
        <h2 className="auth-heading">Welcome back</h2>
        <p className="auth-desc">Sign in to your account</p>

        {error && (
          <div className="auth-error" role="alert">
            <span className="auth-error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉️</span>
              <input
                id="login-email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                autoComplete="email"
                inputMode="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className="auth-input auth-input-pw"
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? <span className="auth-spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" id="go-to-register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
