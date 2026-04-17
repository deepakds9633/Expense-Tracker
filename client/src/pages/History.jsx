import { useEffect, useState } from 'react'
import { getTransactions, deleteTransaction } from '../api/api'

export default function History() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState(null)

  const fetchTx = async () => {
    try {
      const r = await getTransactions()
      setTransactions(r.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTx() }, [])

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind })
    setTimeout(() => setToast(null), 2000)
  }

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t._id !== id))
      showToast('Deleted ✓')
    } catch { showToast('Failed to delete', 'error') }
  }

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })

  const filtered = transactions.filter(t =>
    filter === 'all' ? true : t.type === filter
  )

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0)

  if (loading) return (
    <div className="page"><div className="loading-center"><div className="spinner"/></div></div>
  )

  return (
    <div className="page">
      <h1 className="page-title">History</h1>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
        <div className="card" style={{ borderColor:'rgba(34,197,94,0.2)', background:'rgba(34,197,94,0.04)' }}>
          <p className="label">Total Income</p>
          <p className="amount-sm text-green" style={{ marginTop:6 }}>{fmt(totalIncome)}</p>
        </div>
        <div className="card" style={{ borderColor:'rgba(244,63,94,0.2)', background:'rgba(244,63,94,0.04)' }}>
          <p className="label">Total Expense</p>
          <p className="amount-sm text-red" style={{ marginTop:6 }}>{fmt(totalExpense)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="seg" style={{ marginBottom:16 }}>
        {['all','expense','income'].map(f => (
          <button key={f}
            className={`seg-btn ${filter===f ? `active ${f}` : ''}`}
            onClick={() => setFilter(f)}>
            {f === 'all' ? '📊 All' : f === 'expense' ? '📤 Expense' : '📥 Income'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card empty">
          <span className="emoji">📭</span>
          No {filter !== 'all' ? filter : ''} transactions found.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(tx => (
            <div className="card" key={tx._id}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px' }}>
              <div className="icon-box" style={{
                background: tx.type==='income' ? 'rgba(34,197,94,0.12)' : 'rgba(244,63,94,0.12)',
                fontSize:'1.1rem'
              }}>
                {tx.source==='coins' ? '🪙' : tx.source==='notes' ? '💵' : '🏦'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontWeight:600, fontSize:'0.88rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {tx.note || (tx.source==='bank' ? tx.accountName : tx.source)}
                </p>
                <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>
                  {tx.source==='bank' ? tx.accountName : (tx.source==='coins' ? 'Coins' : 'Notes')}
                  {' · '}
                  {new Date(tx.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                </p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                <p style={{ fontWeight:700, fontSize:'0.9rem' }}
                  className={tx.type==='income' ? 'text-green' : 'text-red'}>
                  {tx.type==='income' ? '+' : '-'}{fmt(tx.amount)}
                </p>
                <button onClick={() => handleDelete(tx._id)}
                  style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.75rem', color:'var(--text-sub)' }}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className={`toast ${toast.kind}`}>{toast.msg}</div>}
    </div>
  )
}
