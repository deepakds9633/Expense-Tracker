import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCash, getAccounts, getRecentTransactions, getTransactions } from '../api/api'
import { useAuth }  from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Dashboard.css'

const BANK_COLORS = ['#7c3aed','#3b82f6','#10b981','#f97316','#ef4444','#06b6d4']

/* ── SVG Donut Chart ──────────────────────────── */
function DonutChart({ cash, bank }) {
  const total = cash + bank
  if (total === 0) return (
    <div className="db-donut-wrap">
      <svg viewBox="0 0 100 100" className="db-donut-svg">
        <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
      </svg>
      <div className="db-donut-center">
        <span className="db-donut-lbl">Empty</span>
      </div>
    </div>
  )
  const R = 36, C = 2 * Math.PI * R
  const cashPct  = cash / total
  const bankPct  = bank / total
  const cashDash = cashPct * C
  const bankDash = bankPct * C
  const gap      = 5
  return (
    <div className="db-donut-wrap">
      <svg viewBox="0 0 100 100" className="db-donut-svg" style={{ transform:'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
        <circle cx="50" cy="50" r={R} fill="none"
          stroke="#10b981" strokeWidth="10"
          strokeDasharray={`${Math.max(cashDash - gap, 0)} ${C}`}
          strokeLinecap="round"/>
        <circle cx="50" cy="50" r={R} fill="none"
          stroke="#7c3aed" strokeWidth="10"
          strokeDasharray={`${Math.max(bankDash - gap, 0)} ${C}`}
          strokeDashoffset={-cashDash}
          strokeLinecap="round"/>
      </svg>
      <div className="db-donut-center">
        <span className="db-donut-pct">{Math.round(cashPct * 100)}%</span>
        <span className="db-donut-lbl">Cash</span>
      </div>
    </div>
  )
}

/* ── CSS Bar Chart ────────────────────────────── */
function MiniBarChart({ data }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1)
  const H = 80
  return (
    <div className="db-bar-chart">
      {data.map((d, i) => (
        <div className="db-bar-group" key={i}>
          <div className="db-bar-pair">
            <div className="db-bar-col">
              <div className="db-bar db-bar-income"
                style={{ height: `${Math.max((d.income / maxVal) * H, 3)}px` }} />
            </div>
            <div className="db-bar-col">
              <div className="db-bar db-bar-expense"
                style={{ height: `${Math.max((d.expense / maxVal) * H, 3)}px` }} />
            </div>
          </div>
          <p className="db-bar-label">{d.name}</p>
        </div>
      ))}
    </div>
  )
}

/* ── Build monthly data ─────────────────────── */
function buildMonthly(txs) {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ name: d.toLocaleString('default',{month:'short'}), year: d.getFullYear(), month: d.getMonth(), income:0, expense:0 })
  }
  for (const tx of txs) {
    const d = new Date(tx.date)
    const m = months.find(x => x.year===d.getFullYear() && x.month===d.getMonth())
    if (m) tx.type==='income' ? (m.income+=tx.amount) : (m.expense+=tx.amount)
  }
  return months
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user }  = useAuth()
  const { isDark, toggle } = useTheme()

  const [cash,      setCash]      = useState({ coins:0, notes:0 })
  const [accounts,  setAccounts]  = useState([])
  const [recent,    setRecent]    = useState([])
  const [txAll,     setTxAll]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [serverErr, setServerErr] = useState(false)

  const fetchAll = async () => {
    setLoading(true); setServerErr(false)
    try {
      const [c,a,r,t] = await Promise.all([getCash(), getAccounts(), getRecentTransactions(), getTransactions()])
      if (c?.data && typeof c.data === 'object') setCash(c.data)
      setAccounts(Array.isArray(a?.data) ? a.data : [])
      setRecent(Array.isArray(r?.data) ? r.data : [])
      setTxAll(Array.isArray(t?.data) ? t.data : [])
    } catch (e) { setServerErr(true) }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchAll() }, [])

  const fmt      = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits:2 })
  const fmtShort = n => n>=100000 ? '₹'+(n/100000).toFixed(1)+'L' : n>=1000 ? '₹'+(n/1000).toFixed(1)+'K' : '₹'+Number(n).toFixed(0)

  const safeAccounts = Array.isArray(accounts) ? accounts : []
  const safeTxAll    = Array.isArray(txAll) ? txAll : []
  const safeRecent   = Array.isArray(recent) ? recent : []

  const totalCash    = (cash?.coins||0) + (cash?.notes||0)
  const totalBank    = safeAccounts.reduce((s,a) => s+(a.balance||0), 0)
  const grandTotal   = totalCash + totalBank
  const totalIncome  = safeTxAll.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)
  const totalExpense = safeTxAll.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)
  const savRate      = totalIncome>0 ? Math.round(((totalIncome-totalExpense)/totalIncome)*100) : 0
  const monthly      = buildMonthly(safeTxAll)

  if (loading) return <div className="page"><div className="loading-center"><div className="spinner"/></div></div>

  if (serverErr) return (
    <div className="page">
      <div className="db-hero" style={{ textAlign:'center', padding:32 }}>
        <div className="db-hero-inner">
          <p style={{ fontSize:'2.5rem', marginBottom:12 }}>🔌</p>
          <p style={{ fontWeight:700, marginBottom:6 }}>Cannot connect to server</p>
          <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.5)', marginBottom:20 }}>Make sure your backend is running</p>
          <button className="btn btn-primary" onClick={fetchAll}>🔄 Retry</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page db-page">

      {/* ════════════════════════════════════
          HERO — Credit Card Style Balance
      ════════════════════════════════════ */}
      <div className="db-hero">
        <div className="db-hero-inner">
          <p className="db-greeting">
            <span>👋</span> Hi, {user?.name?.split(' ')[0] || 'there'}
            <button className="theme-toggle" onClick={toggle} title="Toggle theme" style={{ marginLeft:'auto' }}>
            </button>
          </p>

          <div className="db-hero-top">
            <div>
              <p className="db-balance-label">Total Net Worth</p>
              <h1 className="db-balance">{fmt(grandTotal)}</h1>
            </div>
            <div className="db-hero-badge">💰</div>
          </div>

          <div className="db-hero-bottom">
            <div className="db-hero-stat">
              <span className="db-hero-stat-label">📈 Income</span>
              <span className="db-hero-stat-val income">{fmtShort(totalIncome)}</span>
            </div>
            <div className="db-hero-stat">
              <span className="db-hero-stat-label">📉 Spent</span>
              <span className="db-hero-stat-val expense">{fmtShort(totalExpense)}</span>
            </div>
            <div className="db-hero-stat">
              <span className="db-hero-stat-label">💎 Saved</span>
              <span className="db-hero-stat-val income">{savRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          STAT CARDS
      ════════════════════════════════════ */}
      <div className="db-stat-row">
        <div className="db-stat-card green">
          <div className="db-stat-icon" style={{ background:'rgba(16,185,129,0.12)' }}>💵</div>
          <span className="db-stat-label">Cash</span>
          <span className="db-stat-val" style={{ color:'var(--green)' }}>{fmt(totalCash)}</span>
        </div>
        <div className="db-stat-card purple">
          <div className="db-stat-icon" style={{ background:'rgba(124,58,237,0.12)' }}>🏦</div>
          <span className="db-stat-label">Bank</span>
          <span className="db-stat-val" style={{ color:'var(--accent)' }}>{fmt(totalBank)}</span>
        </div>
        <div className="db-stat-card red">
          <div className="db-stat-icon" style={{ background:'rgba(239,68,68,0.12)' }}>📊</div>
          <span className="db-stat-label">Accounts</span>
          <span className="db-stat-val" style={{ color:'var(--blue)' }}>{safeAccounts.length}</span>
        </div>
      </div>

      {/* ════════════════════════════════════
          WALLET OVERVIEW
      ════════════════════════════════════ */}
      <div className="section-header">
        <span className="section-title">💼 Wallet Overview</span>
      </div>
      <div className="db-wallet-card">
        <DonutChart cash={totalCash} bank={totalBank}/>
        <div className="db-wallet-legend">
          <div className="db-wallet-item">
            <div className="db-wallet-icon" style={{ background:'rgba(16,185,129,0.12)' }}>💵</div>
            <div className="db-wallet-info">
              <p className="db-wallet-name">Cash</p>
              <p className="db-wallet-amt" style={{ color:'var(--green)' }}>{fmt(totalCash)}</p>
            </div>
          </div>
          <div className="db-wallet-item">
            <div className="db-wallet-icon" style={{ background:'rgba(124,58,237,0.12)' }}>🏦</div>
            <div className="db-wallet-info">
              <p className="db-wallet-name">Bank</p>
              <p className="db-wallet-amt" style={{ color:'var(--accent)' }}>{fmt(totalBank)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          CASH BREAKDOWN
      ════════════════════════════════════ */}
      <div className="db-cash-row">
        <div className="db-cash-card" data-emoji="🪙">
          <div className="db-cash-header">
            <div className="db-cash-dot" style={{ background:'#f59e0b' }}/>
            <span className="db-cash-title">Coins</span>
          </div>
          <p className="db-cash-val" style={{ color:'#f59e0b' }}>{fmt(cash.coins)}</p>
          <div className="db-progress-track">
            <div className="db-progress-fill" style={{
              width: totalCash>0 ? `${(cash.coins/totalCash)*100}%` : '0%',
              background: 'linear-gradient(90deg,#fbbf24,#f59e0b)'
            }}/>
          </div>
        </div>
        <div className="db-cash-card" data-emoji="💵">
          <div className="db-cash-header">
            <div className="db-cash-dot" style={{ background:'var(--green)' }}/>
            <span className="db-cash-title">Notes</span>
          </div>
          <p className="db-cash-val" style={{ color:'var(--green)' }}>{fmt(cash.notes)}</p>
          <div className="db-progress-track">
            <div className="db-progress-fill" style={{
              width: totalCash>0 ? `${(cash.notes/totalCash)*100}%` : '0%',
              background: 'linear-gradient(90deg,#34d399,#10b981)'
            }}/>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          BANK ACCOUNTS
      ════════════════════════════════════ */}
      <div className="section-header">
        <span className="section-title">🏦 Bank Accounts</span>
        <button className="btn btn-ghost" style={{ fontSize:'0.7rem', padding:'5px 12px' }}
          onClick={() => navigate('/accounts')}>Manage →</button>
      </div>

      {safeAccounts.length === 0 ? (
        <div className="card empty">
          <span className="emoji">🏦</span>No bank accounts yet
          <br/>
          <button className="btn btn-primary" style={{ marginTop:14 }}
            onClick={() => navigate('/accounts')}>+ Add Account</button>
        </div>
      ) : (
        <div className="db-bank-list">
          {safeAccounts.map((acc, i) => {
            const c   = acc.color || BANK_COLORS[i % BANK_COLORS.length]
            const pct = totalBank>0 ? Math.min((acc.balance/totalBank)*100,100) : 0
            return (
              <div className="db-bank-card" key={acc._id}>
                <div className="db-bank-left">
                  <div className="db-bank-avatar"
                    style={{ background:`${c}18`, border:`1.5px solid ${c}30` }}>
                    🏦
                  </div>
                  <div>
                    <p className="db-bank-name">{acc.name}</p>
                    <p className="db-bank-sub">{pct.toFixed(0)}% of bank total</p>
                  </div>
                </div>
                <div className="db-bank-right">
                  <p className="db-bank-bal" style={{ color:c }}>{fmt(acc.balance)}</p>
                  <div className="db-progress-track" style={{ width:70 }}>
                    <div className="db-progress-fill" style={{ width:`${pct}%`, background:c }}/>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ════════════════════════════════════
          MONTHLY ACTIVITY
      ════════════════════════════════════ */}
      <div className="section-header" style={{ marginTop:24 }}>
        <span className="section-title">📊 Monthly Activity</span>
        <div className="db-chart-pill">
          <span><span className="db-leg-dot" style={{ background:'#10b981' }}/>In</span>
          <span><span className="db-leg-dot" style={{ background:'#ef4444' }}/>Out</span>
        </div>
      </div>
      <div className="db-chart-card">
        <MiniBarChart data={monthly}/>
      </div>

      {/* ════════════════════════════════════
          RECENT TRANSACTIONS
      ════════════════════════════════════ */}
      <div className="section-header" style={{ marginTop:24 }}>
        <span className="section-title">🕒 Recent</span>
        <button className="btn btn-ghost" style={{ fontSize:'0.7rem', padding:'5px 12px' }}
          onClick={() => navigate('/history')}>See All →</button>
      </div>

      {safeRecent.length === 0 ? (
        <div className="card empty">
          <span className="emoji">📭</span>No transactions yet
        </div>
      ) : (
        <div className="db-tx-list">
          {safeRecent.map(tx => (
            <div className="db-tx" key={tx._id}>
              <div className="db-tx-icon" style={{
                background: tx.type==='income' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'
              }}>
                {tx.source==='coins' ? '🪙' : tx.source==='notes' ? '💵' : '🏦'}
              </div>
              <div className="db-tx-info">
                <p className="db-tx-note">{tx.note || (tx.source==='bank' ? tx.accountName : tx.source)}</p>
                <p className="db-tx-meta">
                  {tx.source==='bank' ? tx.accountName : tx.source}
                  <span className="db-tx-dot"/>
                  {new Date(tx.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
                </p>
              </div>
              <div className="db-tx-right">
                <p className={`db-tx-amt ${tx.type==='income'?'text-green':'text-red'}`}>
                  {tx.type==='income'?'+':'-'}{fmt(tx.amount)}
                </p>
                <span className={`db-tx-badge ${tx.type==='income'?'badge-in':'badge-ex'}`}>
                  {tx.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD BUTTON */}
      <button className="btn btn-primary btn-full db-add-btn" id="dash-add-btn"
        onClick={() => navigate('/add')}>
        ➕ Add Transaction
      </button>
    </div>
  )
}
