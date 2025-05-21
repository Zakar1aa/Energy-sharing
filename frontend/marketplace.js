const ETH_ADDRESSES = {
  prosumer1: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  prosumer2: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  prosumer3: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  prosumer4: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
};

const $ = id => document.getElementById(id);

// Fetch and display prosumer balances
async function fetchBalance(addr) {
  const res = await fetch(`/api/energy/balance/${addr}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { balance } = await res.json();
  return parseFloat(balance).toFixed(2);
}

async function refreshBalances() {
  const tbody = $("balances");
  tbody.innerHTML = "";
  for (const addr of Object.values(ETH_ADDRESSES)) {
    let bal = "–";
    try { bal = await fetchBalance(addr); }
    catch { bal = "ERR"; }
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${addr}</td><td>${bal}</td>`;
    tbody.appendChild(tr);
  }
  const fb = $("balancesFeedback");
  fb.innerText = "Balances updated";
  setTimeout(() => fb.innerText = "", 2000);
}

// Populate all prosumer <select>s
function populateProsumerSelects() {
  const ids = ["produceProsumer","fromProsumer","sellProsumer","buyProsumer"];
  ids.forEach(selId => {
    const sel = $(selId);
    Object.entries(ETH_ADDRESSES).forEach(([name, addr]) => {
      const o = document.createElement("option");
      o.value = name;
      o.innerText = `${name} (${addr.slice(0,6)}…${addr.slice(-4)})`;
      sel.appendChild(o);
    });
  });
}

// Generic feedback helper
function showFeedback(id, msg, isError = false) {
  const el = $(id);
  el.innerText = msg;
  el.classList.toggle("error", isError);
  setTimeout(() => { el.innerText = ""; el.classList.remove("error"); }, 3000);
}

// Produce energy
$("produceForm").addEventListener("submit", async e => {
  e.preventDefault();
  const prosumer = $("produceProsumer").value;
  const amount   = parseFloat($("produceAmount").value);
  const res = await fetch("/api/energy/produce", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ prosumer, amount })
  });
  if (res.ok) {
    showFeedback("produceFeedback", "✅ Produced!");
    await refreshBalances();
  } else {
    const { error } = await res.json();
    showFeedback("produceFeedback", `❌ ${error}`, true);
  }
});

// Transfer energy
$("transferForm").addEventListener("submit", async e => {
  e.preventDefault();
  const prosumer = $("fromProsumer").value;
  const to       = $("toAddress").value;
  const amount   = parseFloat($("transferAmount").value);
  const res = await fetch("/api/energy/transfer", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ prosumer, to, amount })
  });
  if (res.ok) {
    showFeedback("transferFeedback", "✅ Transferred!");
    await refreshBalances();
  } else {
    const { error } = await res.json();
    showFeedback("transferFeedback", `❌ ${error}`, true);
  }
});

// Submit sell order
$("sellForm").addEventListener("submit", async e => {
  e.preventDefault();
  const prosumer = $("sellProsumer").value;
  const qty      = parseFloat($("sellQty").value);
  const price    = parseFloat($("sellPrice").value);
  const res = await fetch("/api/auction/submit", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ role:"sell", prosumer, qty, price })
  });
  if (res.ok) {
    showFeedback("sellFeedback", "✅ Order accepted");
    await refreshOrderBook();
  } else {
    const { error } = await res.json();
    showFeedback("sellFeedback", `❌ ${error}`, true);
  }
});

// Submit buy order
$("buyForm").addEventListener("submit", async e => {
  e.preventDefault();
  const prosumer = $("buyProsumer").value;
  const qty      = parseFloat($("buyQty").value);
  const price    = parseFloat($("buyPrice").value);
  const res = await fetch("/api/auction/submit", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ role:"buy", prosumer, qty, price })
  });
  if (res.ok) {
    showFeedback("buyFeedback", "✅ Order accepted");
    await refreshOrderBook();
  } else {
    const { error } = await res.json();
    showFeedback("buyFeedback", `❌ ${error}`, true);
  }
});

// Refresh order book
async function refreshOrderBook() {
  const pre = $("orderBook");
  pre.innerText = "Loading…";
  try {
    const res = await fetch("/api/auction/book");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { bids, asks } = await res.json();
    pre.innerText =
      "BIDS:\n" + JSON.stringify(bids, null, 2) +
      "\n\nASKS:\n" + JSON.stringify(asks, null, 2);
  } catch (e) {
    pre.innerText = `Error: ${e.message}`;
  }
}

// Refresh match history
async function refreshHistory() {
  const pre = $("matchHistory");
  pre.innerText = "Loading…";
  try {
    const res = await fetch("/api/auction/history");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const all = await res.json();
    const last5 = all.slice(-5).reverse();
    pre.innerText = JSON.stringify(last5, null, 2);
  } catch (e) {
    pre.innerText = `Error: ${e.message}`;
  }
}

// Wire buttons & initialize
$("refreshBalances").addEventListener("click", refreshBalances);
$("refreshBook").addEventListener("click", refreshOrderBook);
$("refreshHistory").addEventListener("click", refreshHistory);

window.addEventListener("DOMContentLoaded", () => {
  populateProsumerSelects();
  refreshBalances();
  refreshOrderBook();
  refreshHistory();
});
