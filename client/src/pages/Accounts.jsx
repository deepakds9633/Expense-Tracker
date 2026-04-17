import { useEffect, useState } from 'react'
import { getCash, updateCash, getAccounts, addAccount, deleteAccount, updateAccount } from '../api/api'

const COLORS = ['#8b5cf6','#3b82f6','#14b8a6','#f97316','#f43f5e','#22c55e']

export default function Accounts() {
  const [cash, setCash] = useState({ coins: 0, notes: 0 })
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // Cash edit state
  const [editingCash, setEditingCash] = useState(false)
  const [coinsVal, setCoinsVal] = useState('')
  const [notesVal, setNotesVal] = useState('')

  // New bank form
  const [showAddBank, setShowAddBank] = useState(false)
  const [bankName, setBankName] = useState('')
  const [bankBalance, setBankBalance] = useState('')
  const [bankColor, setBankColor] = useState(COLORS[0])

  // Edit bank
  const [editingId, setEditingId] = useState(null)
  const [editBalance, setEditBalance] = useState('')

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind })
    setTimeout(() => setToast(null), 2200)
  }

  const fetchAll = async () => {
    const [c, a] = await Promise.all([getCash(), getAccounts()])
    setCash(c.data); setAccounts(a.data); setLoading(false)
  }
  useEffect(() => { fetchAll() }, [])

  const saveCash = async () => {
    try {
      const r = await updateCash({
        coins: parseFloat(coinsVal) || 0,
        notes: parseFloat(notesVal) || 0,
      })
      setCash(r.data)
      setEditingCash(false)
      showToast('Cash updated ✓')
    } catch { showToast('Failed to update cash', 'error') }
  }

  const handleAddBank = async (e) => {
    e.preventDefault()
    if (!bankName.trim()) { showToast('Enter bank name', 'error'); return }
    try {
      const r = await addAccount({ name: bankName.trim(), balance: parseFloat(bankBalance) || 0, color: bankColor })
      setAccounts(prev => [...prev, r.data])
      setBankName(''); setBankBalance(''); setBankColor(COLORS[0]); setShowAddBank(false)
      showToast(`${bankName} added ✓`)
    } catch(err) { showToast(err.response?.data?.message || 'Error adding account', 'error') }
  }

  const handleDeleteAccount = async (id, name) => {
    try {
      await deleteAccount(id)
      setAccounts(prev => prev.filter(a => a._id !== id))
      showToast(`${name} removed`)
    } catch { showToast('Failed to delete', 'error') }
  }

  const handleEditBalance = async (acc) => {
    try {
      const r = await updateAccount(acc._id, { balance: parseFloat(editBalance) || 0 })
      setAccounts(prev => prev.map(a => a._id === acc._id ? r.data : a))
      setEditingId(null)
      showToast(`${acc.name} updated ✓`)
    } catch { showToast('Failed to update', 'error') }
  }

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })

  if (loading) return <div className="page"><div className="loading-center"><div className="spinner"/></div></div>

  return (
    <div className="page">
      <h1 className="page-title">Accounts</h1>

      {/* ── Cash Section ── */}
      <div className="section-header">
        <span className="section-title">💵 Cash</span>
        {!editingCash && (
          <button className="btn btn-ghost" style={{ fontSize:'0.72rem', padding:'5px 12px' }}
            onClick={() => { setCoinsVal(cash.coins); setNotesVal(cash.notes); setEditingCash(true) }}>
            ✏️ Edit
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom:20 }}>
        {editingCash ? (
          <div>
            <div className="input-group">
              <label>🪙 Coins (₹)</label>
              <input className="input" type="number" min="0" step="0.01"
                value={coinsVal} onChange={e => setCoinsVal(e.target.value)} />
            </div>
            <div className="input-group">
              <label>💵 Notes (₹)</label>
              <input className="input" type="number" min="0" step="0.01"
                value={notesVal} onChange={e => setNotesVal(e.target.value)} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={saveCash}>Save</button>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setEditingCash(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ textAlign:'center' }}>
              <p className="label">🪙 Coins</p>
              <p className="amount-sm" style={{ marginTop:6, color:'#fbbf24' }}>{fmt(cash.coins)}</p>
            </div>
            <div style={{ textAlign:'center' }}>
              <p className="label">💵 Notes</p>
              <p className="amount-sm" style={{ marginTop:6, color:'var(--green)' }}>{fmt(cash.notes)}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Bank Accounts ── */}
      <div className="section-header">
        <span className="section-title">🏦 Bank Accounts</span>
        <button className="btn btn-ghost" style={{ fontSize:'0.72rem', padding:'5px 12px' }}
          id="add-bank-btn" onClick={() => setShowAddBank(!showAddBank)}>
          {showAddBank ? '✕ Cancel' : '+ Add'}
        </button>
      </div>

      {/* Add bank form */}
      {showAddBank && (
        <form onSubmit={handleAddBank} className="card" style={{ marginBottom:16, borderColor:'rgba(139,92,246,0.4)', boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)', background: 'rgba(139, 92, 246, 0.05)' }}>
          <p style={{ fontWeight:800, marginBottom:16, color:'var(--text)', textShadow: '0 0 10px rgba(139,92,246,0.5)' }}>New Bank Account</p>
          <div className="input-group">
            <label>Bank Name</label>
            <input id="bank-name-input" className="input" type="text"
              placeholder="e.g. SBI, Canara, HDFC" value={bankName}
              onChange={e => setBankName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Opening Balance (₹)</label>
            <input id="bank-balance-input" className="input" type="number" min="0" step="0.01"
              placeholder="0.00" value={bankBalance} onChange={e => setBankBalance(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Color</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {COLORS.map(c => (
                <button key={c} type="button"
                  onClick={() => setBankColor(c)}
                  style={{
                    width:28, height:28, borderRadius:'50%', background:c, border:'none', cursor:'pointer',
                    outline: bankColor===c ? `3px solid #fff` : 'none',
                    outlineOffset: 2,
                  }} />
              ))}
            </div>
          </div>
          <button id="save-bank-btn" type="submit" className="btn btn-primary btn-full" style={{ marginTop:8 }}>
            🏦 Add Account
          </button>
        </form>
      )}

      {accounts.length === 0 ? (
        <div className="card empty">
          <span className="emoji">🏦</span>
          No bank accounts yet. Add one above!
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {accounts.map((acc, i) => (
            <div className="card" key={acc._id}
              style={{ borderLeft:`4px solid ${acc.color || COLORS[i%COLORS.length]}`, paddingLeft: 18 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{
                    width:10, height:10, borderRadius:'50%',
                    background: acc.color || COLORS[i % COLORS.length],
                    display:'inline-block'
                  }} />
                  <span style={{ fontWeight:700 }}>{acc.name}</span>
                </div>
                <button onClick={() => handleDeleteAccount(acc._id, acc.name)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-sub)', fontSize:'1rem' }}>
                  🗑
                </button>
              </div>

              {editingId === acc._id ? (
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input className="input" type="number" min="0" step="0.01"
                    value={editBalance} onChange={e => setEditBalance(e.target.value)}
                    style={{ flex:1 }} />
                  <button className="btn btn-primary" style={{ padding:'10px 16px' }}
                    onClick={() => handleEditBalance(acc)}>Save</button>
                  <button className="btn btn-ghost" style={{ padding:'10px 16px' }}
                    onClick={() => setEditingId(null)}>✕</button>
                </div>
              ) : (
                <div style={{ display:'flex', align:'center', justifyContent:'space-between' }}>
                  <p style={{ fontSize:'1.2rem', fontWeight:800, color: acc.color || COLORS[i%COLORS.length] }}>
                    {fmt(acc.balance)}
                  </p>
                  <button className="btn btn-ghost" style={{ fontSize:'0.72rem', padding:'5px 12px' }}
                    onClick={() => { setEditingId(acc._id); setEditBalance(acc.balance) }}>
                    ✏️ Edit Balance
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && <div className={`toast ${toast.kind}`}>{toast.msg}</div>}
    </div>
  )
}
