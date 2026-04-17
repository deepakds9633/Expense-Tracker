import axios from 'axios'

const BASE = '/api'

// ── Auto-attach JWT token to every request ────────────
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('et_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth ──────────────────────────────────────────────
export const register = (data) => axios.post(`${BASE}/auth/register`, data)
export const login    = (data) => axios.post(`${BASE}/auth/login`, data)
export const getMe    = ()     => axios.get(`${BASE}/auth/me`)

// ── Cash ──────────────────────────────────────────────
export const getCash    = ()     => axios.get(`${BASE}/cash`)
export const updateCash = (data) => axios.put(`${BASE}/cash`, data)

// ── Bank Accounts ─────────────────────────────────────
export const getAccounts    = ()          => axios.get(`${BASE}/accounts`)
export const addAccount     = (data)      => axios.post(`${BASE}/accounts`, data)
export const updateAccount  = (id, data)  => axios.put(`${BASE}/accounts/${id}`, data)
export const deleteAccount  = (id)        => axios.delete(`${BASE}/accounts/${id}`)

// ── Transactions ──────────────────────────────────────
export const getTransactions       = ()    => axios.get(`${BASE}/transactions`)
export const getRecentTransactions = ()    => axios.get(`${BASE}/transactions/recent`)
export const addTransaction        = (data)=> axios.post(`${BASE}/transactions`, data)
export const deleteTransaction     = (id)  => axios.delete(`${BASE}/transactions/${id}`)
