// frontend/script.js

// —————————————————————————————————
// 1) LOGIN HANDLER (your existing code)
// —————————————————————————————————
document
  .getElementById("login-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.error) {
      alert(data.error);
    } else {
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("email", data.user.email);
      window.location.href = "dashboard.html";
    }
  });

// —————————————————————————————————
// 2) MARKETPLACE WIRING
// —————————————————————————————————
// Only run this section if we're on the marketplace page
if (document.getElementById("balances")) {
  const ETH_ADDRESSES = {
    prosumer1: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    prosumer2: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    prosumer3: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    prosumer4: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  };

  function el(id) {
    return document.getElementById(id);
  }

  // fetch a single on-chain balance
  async function fetchBalance(addr) {
    const res = await fetch(`/api/energy/balance/${addr}`);
    if (!res.ok) throw new Error(await res.text());
    const { balance } = await res.json();
    return parseFloat(balance).toFixed(2);
  }

  // refresh the table
  async function refreshBalances() {
    const tbody = el("balances").querySelector("tbody");
    tbody.innerHTML = "";
    for (const [name, addr] of Object.entries(ETH_ADDRESSES)) {
      let bal = "—";
      try {
        bal = await fetchBalance(addr);
      } catch (e) {
        bal = "ERR";
      }
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${name}</td><td>${addr}</td><td>${bal}</td>`;
      tbody.appendChild(tr);
    }
  }

  // PRODUCE ENERGY
  el("produceBtn").onclick = async () => {
    const amt = parseFloat(el("produceAmount").value);
    const res = await fetch("/api/energy/produce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amt }),
    });
    el("produceResult").innerText = res.ok
      ? "✅ Energy produced"
      : `❌ ${await res.text()}`;
    await refreshBalances();
  };

  // TRANSFER ENERGY
  el("transferBtn").onclick = async () => {
    const fromName = el("fromProsumer").value;
    const toName = el("toProsumer").value;
    const toAddr = ETH_ADDRESSES[toName];
    const amt = parseFloat(el("transferAmount").value);
    const res = await fetch("/api/energy/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: toAddr, amount: amt }),
    });
    el("transferResult").innerText = res.ok
      ? "✅ Energy transferred"
      : `❌ ${await res.text()}`;
    await refreshBalances();
  };

  // on-load: populate the dropdowns & wire the refresh button
  window.addEventListener("DOMContentLoaded", () => {
    const from = el("fromProsumer"),
      to = el("toProsumer");
    Object.keys(ETH_ADDRESSES).forEach((name) => {
      [from, to].forEach((sel) => {
        const o = document.createElement("option");
        o.value = name;
        o.innerText = name;
        sel.appendChild(o);
      });
    });
    el("refresh").onclick = refreshBalances;
    refreshBalances();
  });
}
