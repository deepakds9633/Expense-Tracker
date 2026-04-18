import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccounts, addTransaction } from '../api/api'

export default function AddTransaction() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [type, setType] = useState('expense')
  const [source, setSource] = useState('notes')   // 'notes' | 'coins' | <accountId>
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    getAccounts().then(r => {
      setAccounts(r.data)
    }).catch(() => {})
  }, [])

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind })
    setTimeout(() => setToast(null), 3000)
  }

  // Determine if source is a bank account id
  const safeAccounts = Array.isArray(accounts) ? accounts : []
  const isBankSource = source !== 'notes' && source !== 'coins'
  const selectedAccount = safeAccounts.find(a => a._id === source)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      showToast('Enter a valid amount', 'error'); return
    }

    setLoading(true)
    try {
      await addTransaction({
        amount: parseFloat(amount),
        type,
        source: isBankSource ? 'bank' : source,
        accountId: isBankSource ? source : undefined,
        note,
      })
      showToast(type === 'expense' ? '💸 Expense recorded!' : '💰 Income added!')
      setAmount('')
      setNote('')
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      if (!err.response) {
        showToast('❌ Cannot connect to server. Make sure backend is running.', 'error')
      } else {
        showToast(err.response?.data?.message || 'Something went wrong', 'error')
      }
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="page">
      <h1 className="page-title">Add Transaction</h1>

      {/* Type toggle */}
      <div className="seg">
        <button id="seg-expense" className={`seg-btn ${type === 'expense' ? 'active expense' : ''}`}
          onClick={() => setType('expense')}>📤 Expense</button>
        <button id="seg-income"  className={`seg-btn ${type === 'income'  ? 'active income'  : ''}`}
          onClick={() => setType('income')}>📥 Income</button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Source — each bank is its own option */}
        <div className="input-group">
          <label>Source</label>
          <select id="source-select" className="input" value={source}
            onChange={e => setSource(e.target.value)}>
            <option value="notes">💵 Notes</option>
            <option value="coins">🪙 Coins</option>
            {safeAccounts.length > 0 && (
              <optgroup label="🏦 Bank Accounts">
                {safeAccounts.map(a => (
                  <option key={a._id} value={a._id}>
                    🏦 {a.name} — ₹{Number(a.balance).toLocaleString('en-IN')}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* No bank accounts hint */}
        {isBankSource === false && safeAccounts.length === 0 && source === 'bank' && (
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 14 }}>
            No bank accounts yet.{' '}
            <button type="button" className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'inline-flex' }}
              onClick={() => navigate('/accounts')}>Add one</button>
          </p>
        )}

        {/* Amount */}
        <div className="input-group">
          <label>Amount (₹)</label>
          <input id="amount-input" className="input" type="number" min="0.01" step="0.01"
            placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
        </div>

        {/* Note */}
        <div className="input-group">
          <label>Note (optional)</label>
          <input id="note-input" className="input" type="text"
            placeholder="e.g. Grocery, Bus ticket..." value={note}
            onChange={e => setNote(e.target.value)} />
        </div>

        {/* Preview card */}
        {amount && Number(amount) > 0 && (
          <div className="card" style={{
            marginBottom: 20,
            background: type === 'expense' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
            borderColor: type === 'expense' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
            boxShadow: type === 'expense' ? '0 4px 20px rgba(239,68,68,0.15)' : '0 4px 20px rgba(16,185,129,0.15)'
          }}>
            <p className="label">Preview</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 6 }}
              className={type === 'expense' ? 'text-red' : 'text-green'}>
              {type === 'expense' ? '−' : '+'}₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
              {isBankSource
                ? `From ${selectedAccount?.name || 'Bank'}`
                : `From ${source === 'notes' ? 'Notes' : 'Coins'}`}
              {note ? ` · ${note}` : ''}
            </p>
          </div>
        )}

        <button id="submit-transaction" type="submit" className="btn btn-primary btn-full"
          disabled={loading}>
          {loading ? '⏳ Saving...' : type === 'expense' ? '💸 Record Expense' : '💰 Add Income'}
        </button>
      </form>

      {toast && <div className={`toast ${toast.kind}`}>{toast.msg}</div>}
    </div>
  )
}

