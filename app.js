const NETWORKS = {
  robinhood: { label: 'Robinhood', group: 'evm', color: 'var(--robinhood)' },
  solana: { label: 'Solana', group: 'solana', color: 'var(--solana)' },
  base: { label: 'Base', group: 'evm', color: 'var(--base)' },
  bnb: { label: 'BNB', group: 'evm', color: 'var(--bnb)' },
};

const state = { traders: [], network: 'all', query: '', sort: 'followers' };
const $ = (id) => document.getElementById(id);

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i], next = text[i + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; i += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === ',' && !quoted) { row.push(cell); cell = ''; continue; }
    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell); if (row.some(Boolean)) rows.push(row); row = []; cell = ''; continue;
    }
    cell += char;
  }
  row.push(cell); if (row.some(Boolean)) rows.push(row);
  const [headers, ...records] = rows;
  return records.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

function number(value) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }
function formatNumber(value) { return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(number(value)); }
function formatUsd(value) {
  const n = number(value);
  const sign = n >= 0 ? '+' : '-';
  return `${sign}$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Math.abs(n))}`;
}
function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function shortWallet(value) { return value ? `${value.slice(0, 7)}…${value.slice(-5)}` : 'not mapped'; }
function visibleRows() {
  const query = state.query.toLowerCase();
  return state.traders
    .filter((trader) => state.network === 'all' || state.network === trader.network_group)
    .filter((trader) => !query || [trader.handle, trader.display_name, trader.evm_wallet].join(' ').toLowerCase().includes(query))
    .sort((a, b) => number(b[state.sort]) - number(a[state.sort]));
}

function render() {
  const rows = visibleRows();
  $('result-count').textContent = `${rows.length} shown / ${state.traders.length} tracked`;
  $('trader-rows').innerHTML = rows.length ? rows.map((trader, index) => {
    const network = NETWORKS[trader.chain] || NETWORKS.robinhood;
    const pnlClass = number(trader.net_pnl_usd) >= 0 ? 'pnl-positive' : 'pnl-negative';
    return `<tr>
      <td><div class="trader"><span class="rank">${String(index + 1).padStart(2, '0')}</span><span><span class="handle">${esc(trader.handle)}</span><span class="display-name">${esc(trader.display_name)}</span></span></div></td>
      <td><span class="network-badge" style="--network-color:${network.color}">${network.label}</span></td>
      <td class="numeric">${formatNumber(trader.followers)}</td>
      <td class="numeric">${formatNumber(trader.fills)}</td>
      <td class="numeric">$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(number(trader.volume_usd))}</td>
      <td class="numeric ${pnlClass}">${formatUsd(trader.net_pnl_usd)}</td>
      <td><a href="${esc(trader.profile_url)}" target="_blank" rel="noopener">fomo ↗</a></td>
      <td><a class="wallet" href="${esc(trader.blockscout_url)}" target="_blank" rel="noopener">${shortWallet(trader.evm_wallet)} ↗</a></td>
      <td><span class="wallet pending">${esc(trader.solana_wallet || 'pending mapping')}</span></td>
    </tr>`;
  }).join('') : '<tr><td colspan="9" class="empty">no traders match this filter</td></tr>';
}

function renderMetrics() {
  $('metric-tracked').textContent = formatNumber(state.traders.length);
  $('metric-evm').textContent = formatNumber(state.traders.filter((trader) => trader.evm_wallet).length);
  $('metric-solana').textContent = formatNumber(state.traders.filter((trader) => !trader.solana_wallet).length);
  $('metric-snapshot').textContent = 'public CSV';
  $('pending-badge').textContent = `${state.traders.filter((trader) => !trader.solana_wallet).length} addresses needed`;
}

async function load() {
  try {
    const response = await fetch('./rhtrenches-traders-for-solana-mapping.csv', { cache: 'no-store' });
    if (!response.ok) throw new Error(`CSV ${response.status}`);
    state.traders = parseCsv(await response.text()).map((trader) => ({ ...trader, chain: 'robinhood', network_group: 'evm' }));
    renderMetrics(); render();
    $('status').textContent = 'local watchlist loaded · read-only';
  } catch (error) {
    $('status').textContent = 'watchlist unavailable';
    $('trader-rows').innerHTML = `<tr><td colspan="9" class="empty">Could not load the local trader CSV. ${esc(error.message)}</td></tr>`;
  }
}

document.querySelectorAll('.network-chip').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.network-chip').forEach((chip) => chip.classList.remove('active'));
  button.classList.add('active'); state.network = button.dataset.network; render();
}));
$('search').addEventListener('input', (event) => { state.query = event.target.value; render(); });
$('sort').addEventListener('change', (event) => { state.sort = event.target.value; render(); });
setInterval(() => { $('clock').textContent = new Date().toLocaleTimeString('en-US', { hour12: false }); }, 1000);
load();
