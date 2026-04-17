/**
 * PDF Report Generator — No external dependencies
 * Opens a styled print window so the user can save as PDF
 */

const fmt  = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })
const fmtD = d => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })

export function generatePDF({ transactions, filterLabel, userName }) {
  const safeTransactions = Array.isArray(transactions) ? transactions : []
  const income  = safeTransactions.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0)
  const expense = safeTransactions.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0)
  const net     = income - expense

  const rows = safeTransactions.map((t, i) => `
    <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td>${fmtD(t.date)}</td>
      <td class="note-col">${t.note || '—'}</td>
      <td>
        <span class="source-tag">
          ${t.source === 'bank' ? `🏦 ${t.accountName || 'Bank'}` : t.source === 'coins' ? '🪙 Coins' : '💵 Notes'}
        </span>
      </td>
      <td>
        <span class="type-badge ${t.type === 'income' ? 'badge-in' : 'badge-ex'}">
          ${t.type === 'income' ? '▲ Income' : '▼ Expense'}
        </span>
      </td>
      <td class="amount-col ${t.type === 'income' ? 'green' : 'red'}">
        ${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}
      </td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Expense Report — ${filterLabel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fff;
      color: #1e293b;
      font-size: 13px;
      padding: 0;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #1e40af 100%);
      color: #fff;
      padding: 32px 40px 28px;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .app-name {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .app-icon {
      width: 38px; height: 38px;
      background: rgba(255,255,255,0.2);
      border-radius: 10px;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .report-meta { text-align: right; font-size: 11px; opacity: 0.75; line-height: 1.7; }

    .filter-badge {
      display: inline-block;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    /* Summary cards */
    .summary {
      display: grid;
      grid-template-columns: repeat(3,1fr);
      gap: 12px;
      background: #f8faff;
      padding: 20px 40px;
      border-bottom: 1px solid #e8ecf5;
    }
    .sum-card {
      background: #fff;
      border-radius: 12px;
      padding: 14px 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border: 1px solid #eef2ff;
    }
    .sum-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
    }
    .sum-label.in   { color: #059669; }
    .sum-label.ex   { color: #dc2626; }
    .sum-label.net  { color: #4c1d95; }
    .sum-val { font-size: 17px; font-weight: 900; letter-spacing: -0.5px; }
    .sum-val.in  { color: #059669; }
    .sum-val.ex  { color: #dc2626; }
    .sum-val.net { color: ${net >= 0 ? '#059669' : '#dc2626'}; }
    .sum-count { font-size: 10px; color: #94a3b8; margin-top: 3px; }

    /* Table area */
    .table-wrap { padding: 20px 40px 40px; }
    .table-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 12px;
    }

    table { width: 100%; border-collapse: collapse; }
    thead th {
      background: #f1f5f9;
      padding: 10px 12px;
      text-align: left;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #64748b;
      border-bottom: 2px solid #e2e8f0;
    }
    thead th:last-child { text-align: right; }

    td {
      padding: 10px 12px;
      vertical-align: middle;
      border-bottom: 1px solid #f1f5f9;
      font-size: 12px;
      color: #334155;
    }
    .row-even { background: #fff; }
    .row-odd  { background: #fafbff; }

    .note-col { font-weight: 600; color: #1e293b; max-width: 160px; }

    .source-tag {
      display: inline-block;
      background: #f1f5f9;
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      white-space: nowrap;
    }

    .type-badge {
      display: inline-block;
      border-radius: 20px;
      padding: 3px 10px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .badge-in  { background: #dcfce7; color: #166534; }
    .badge-ex  { background: #fee2e2; color: #991b1b; }

    .amount-col { text-align: right; font-weight: 800; font-size: 12.5px; }
    .amount-col.green { color: #059669; }
    .amount-col.red   { color: #dc2626; }

    /* Footer */
    .footer {
      text-align: center;
      padding: 16px;
      font-size: 10px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
    }

    /* Empty */
    .empty-msg {
      text-align: center;
      padding: 48px;
      color: #94a3b8;
      font-size: 14px;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-top">
      <div class="app-name">
        <span class="app-icon">💰</span>
        My Money Tracker
      </div>
      <div class="report-meta">
        <div><strong>${userName || 'User'}</strong></div>
        <div>Generated: ${new Date().toLocaleString('en-IN')}</div>
        <div style="margin-top:6px">
          <span class="filter-badge">Filter: ${filterLabel}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="summary">
    <div class="sum-card">
      <p class="sum-label in">📈 Total Income</p>
      <p class="sum-val in">${fmt(income)}</p>
      <p class="sum-count">${safeTransactions.filter(t=>t.type==='income').length} transactions</p>
    </div>
    <div class="sum-card">
      <p class="sum-label ex">📉 Total Expense</p>
      <p class="sum-val ex">${fmt(expense)}</p>
      <p class="sum-count">${safeTransactions.filter(t=>t.type==='expense').length} transactions</p>
    </div>
    <div class="sum-card">
      <p class="sum-label net">💎 Net Balance</p>
      <p class="sum-val net">${net >= 0 ? '+' : ''}${fmt(net)}</p>
      <p class="sum-count">${safeTransactions.length} total records</p>
    </div>
  </div>

  <div class="table-wrap">
    <p class="table-title">Transaction Details</p>

    ${safeTransactions.length === 0
      ? '<div class="empty-msg">No transactions found for this filter.</div>'
      : `<table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Source</th>
              <th>Type</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`
    }
  </div>

  <div class="footer">
    My Money Tracker · Expense Report · ${new Date().getFullYear()} · Confidential
  </div>

  <script>
    window.onload = () => { window.print(); }
  </script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) { alert('Please allow popups to download the report.'); return }
  win.document.write(html)
  win.document.close()
}

/**
 * Build filter options based on transactions + accounts
 */
export function buildFilterOptions(transactions, accounts) {
  const safeAccounts = Array.isArray(accounts) ? accounts : []
  const options = [
    { value: 'all',     label: '📊 All Transactions' },
    { value: 'income',  label: '📈 Income Only' },
    { value: 'expense', label: '📉 Expense Only' },
    { value: 'cash',    label: '💵 All Cash (Coins + Notes)' },
    { value: 'coins',   label: '🪙 Coins Only' },
    { value: 'notes',   label: '💵 Notes Only' },
  ]
  // Add each bank account
  for (const acc of safeAccounts) {
    options.push({ value: `bank_${acc._id}`, label: `🏦 ${acc.name}`, accountId: acc._id, accountName: acc.name })
  }
  return options
}

/**
 * Apply a filter to the transactions array
 */
export function applyFilter(transactions, filterValue) {
  const safeTransactions = Array.isArray(transactions) ? transactions : []
  if (filterValue === 'all')     return safeTransactions
  if (filterValue === 'income')  return safeTransactions.filter(t => t.type === 'income')
  if (filterValue === 'expense') return safeTransactions.filter(t => t.type === 'expense')
  if (filterValue === 'cash')    return safeTransactions.filter(t => t.source === 'coins' || t.source === 'notes')
  if (filterValue === 'coins')   return safeTransactions.filter(t => t.source === 'coins')
  if (filterValue === 'notes')   return safeTransactions.filter(t => t.source === 'notes')
  if (filterValue.startsWith('bank_')) {
    const id = filterValue.replace('bank_', '')
    return safeTransactions.filter(t => t.source === 'bank' && t.accountId === id)
  }
  return safeTransactions
}
