import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerApi } from '../api/api'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const validate = () => {
    if (!name.trim())     return 'Full name is required.'
    if (name.trim().length < 2) return 'Name must be at least 2 characters.'
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
      const { data } = await registerApi({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      })
      login({ _id: data._id, name: data.name, email: data.email }, data.token)
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed. Please try again.')
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
        <p className="auth-subtitle">Your personal expense tracker</p>
      </div>

      {/* Card */}
      <div className="auth-card">
        <h2 className="auth-heading">Create account</h2>
        <p className="auth-desc">Join and start tracking your expenses</p>

        {error && (
          <div className="auth-error" role="alert">
            <span className="auth-error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="auth-field">
            <label htmlFor="reg-name">Full Name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">👤</span>
              <input
                id="reg-name"
                type="text"
                className="auth-input"
                placeholder="Your full name"
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="reg-email">Email</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉️</span>
              <input
                id="reg-email"
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
            <label htmlFor="reg-password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                className="auth-input auth-input-pw"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                autoComplete="new-password"
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
            {/* Password strength hint */}
            {password.length > 0 && (
              <div className="pw-strength">
                <div className="pw-bars">
                  <div className={`pw-bar ${password.length >= 1 ? 'active' : ''}`} style={{ background: password.length >= 8 ? 'var(--green)' : password.length >= 6 ? '#f97316' : 'var(--red)' }} />
                  <div className={`pw-bar ${password.length >= 6 ? 'active' : ''}`} style={{ background: password.length >= 8 ? 'var(--green)' : '#f97316' }} />
                  <div className={`pw-bar ${password.length >= 8 ? 'active' : ''}`} style={{ background: 'var(--green)' }} />
                </div>
                <span className="pw-label">
                  {password.length < 6 ? 'Too short' : password.length < 8 ? 'Fair' : 'Strong'}
                </span>
              </div>
            )}
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? <span className="auth-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" id="go-to-login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
