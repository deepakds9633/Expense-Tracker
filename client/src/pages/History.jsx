import { useEffect, useState } from 'react'
import { getTransactions, getAccounts, deleteTransaction } from '../api/api'
import { useAuth }  from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { generatePDF, buildFilterOptions, applyFilter } from '../utils/pdfReport'
import './History.css'

export default function History() {
  const { user }           = useAuth()
  const { isDark, toggle } = useTheme()

  const [transactions, setTransactions] = useState([])
  const [accounts,     setAccounts]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [typeFilter,   setTypeFilter]   = useState('all')
  const [pdfFilter,    setPdfFilter]    = useState('all')
  const [showPDF,      setShowPDF]      = useState(false)
  const [toast,        setToast]        = useState(null)

  const fetchAll = async () => {
    try {
      const [txRes, accRes] = await Promise.all([getTransactions(), getAccounts()])
      setTransactions(txRes.data)
      setAccounts(accRes.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const showToast = (msg, kind='success') => {
    setToast({ msg, kind })
    setTimeout(() => setToast(null), 2200)
  }

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t._id !== id))
      showToast('Transaction deleted ✓')
    } catch { showToast('Failed to delete', 'error') }
  }

  const fmt = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })

  const safeTransactions = Array.isArray(transactions) ? transactions : []
  const safeAccounts     = Array.isArray(accounts) ? accounts : []

  // Type filter (all / income / expense)
  const filtered = safeTransactions.filter(t =>
    typeFilter === 'all' ? true : t.type === typeFilter
  )

  // Totals
  const totalIncome  = filtered.filter(t => t.type==='income').reduce((s,t) => s+t.amount, 0)
  const totalExpense = filtered.filter(t => t.type==='expense').reduce((s,t) => s+t.amount, 0)

  // PDF filter options (all / income / expense / cash / coins / notes / per-bank)
  const pdfOptions = buildFilterOptions(safeTransactions, safeAccounts)

  const handleDownloadPDF = () => {
    const chosen  = pdfOptions.find(o => o.value === pdfFilter) || pdfOptions[0]
    const txSlice = applyFilter(safeTransactions, pdfFilter)
    generatePDF({ transactions: txSlice, filterLabel: chosen.label, userName: user?.name })
    showToast('📄 Opening print dialog…')
  }

  if (loading) return <div className="page"><div className="loading-center"><div className="spinner"/></div></div>

  return (
    <div className="page hist-page">

      {/* ── Page Header ─────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">History</h1>
        <button className="theme-toggle" onClick={toggle} title="Toggle theme">
        </button>
      </div>

      {/* ── Summary Cards ───────────────────── */}
      <div className="hist-summary">
        <div className="hist-sum-card green">
          <span className="hist-sum-icon">📈</span>
          <div>
            <p className="hist-sum-label">Income</p>
            <p className="hist-sum-val green-c">{fmt(totalIncome)}</p>
          </div>
        </div>
        <div className="hist-sum-card red">
          <span className="hist-sum-icon">📉</span>
          <div>
            <p className="hist-sum-label">Expense</p>
            <p className="hist-sum-val red-c">{fmt(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* ── Type Filter Tabs ────────────────── */}
      <div className="seg" style={{ marginBottom: 16 }}>
        {['all','income','expense'].map(f => (
          <button key={f}
            className={`seg-btn ${typeFilter===f ? `active ${f}` : ''}`}
            onClick={() => setTypeFilter(f)}>
            {f==='all' ? '📊 All' : f==='income' ? '📈 Income' : '📉 Expense'}
          </button>
        ))}
      </div>

      {/* ── PDF Download Panel ──────────────── */}
      <div className={`hist-pdf-panel ${showPDF ? 'open' : ''}`}>
        <button className="hist-pdf-toggle" onClick={() => setShowPDF(p => !p)}>
          <span className="hist-pdf-toggle-left">
            <span className="hist-pdf-icon">📄</span>
            <div>
              <p className="hist-pdf-title">Download Report</p>
              <p className="hist-pdf-sub">Export as PDF</p>
            </div>
          </span>
          <span className={`hist-pdf-arrow ${showPDF ? 'up' : ''}`}>›</span>
        </button>

        {showPDF && (
          <div className="hist-pdf-body">
            <p className="hist-pdf-section-label">Choose what to export:</p>
            <div className="hist-pdf-options">
              {pdfOptions.map(opt => (
                <button key={opt.value}
                  className={`hist-pdf-opt ${pdfFilter===opt.value ? 'selected' : ''}`}
                  onClick={() => setPdfFilter(opt.value)}>
                  {opt.label}
                  {pdfFilter===opt.value && <span className="hist-pdf-check">✓</span>}
                </button>
              ))}
            </div>
            <div className="hist-pdf-info">
              <span className="hist-pdf-info-icon">ℹ️</span>
              <span>
                {applyFilter(transactions, pdfFilter).length} records will be exported
              </span>
            </div>
            <button className="btn btn-primary btn-full hist-pdf-btn" onClick={handleDownloadPDF}>
              📥 Download PDF Report
            </button>
          </div>
        )}
      </div>

      {/* ── Transaction List ────────────────── */}
      {filtered.length === 0 ? (
        <div className="card empty">
          <span className="emoji">📭</span>
          No {typeFilter!=='all' ? typeFilter : ''} transactions found.
        </div>
      ) : (
        <div className="hist-tx-list">
          {filtered.map(tx => (
            <div className="hist-tx card" key={tx._id}>
              <div className="hist-tx-icon" style={{
                background: tx.type==='income' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'
              }}>
                {tx.source==='coins' ? '🪙' : tx.source==='notes' ? '💵' : '🏦'}
              </div>
              <div className="hist-tx-info">
                <p className="hist-tx-note">
                  {tx.note || (tx.source==='bank' ? tx.accountName : tx.source)}
                </p>
                <p className="hist-tx-meta">
                  <span>{tx.source==='bank' ? tx.accountName : (tx.source==='coins' ? 'Coins' : 'Notes')}</span>
                  <span className="hist-dot"/>
                  <span>{new Date(tx.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
                </p>
              </div>
              <div className="hist-tx-right">
                <p className={`hist-tx-amt ${tx.type==='income'?'text-green':'text-red'}`}>
                  {tx.type==='income' ? '+' : '-'}{fmt(tx.amount)}
                </p>
                <span className={`hist-tx-badge ${tx.type==='income'?'badge-in':'badge-ex'}`}>
                  {tx.type}
                </span>
                <button className="hist-del" onClick={() => handleDelete(tx._id)} title="Delete">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className={`toast ${toast.kind}`}>{toast.msg}</div>}
    </div>
  )
}
