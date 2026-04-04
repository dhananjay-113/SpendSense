
let transactions = JSON.parse(localStorage.getItem("ff_data")) || [
  {
    id: 1,
    date: "2026-03-01",
    category: "Salary",
    amount: 5000,
    type: "income",
    desc: "Paycheck",
  },
  {
    id: 2,
    date: "2026-03-05",
    category: "Rent",
    amount: 1200,
    type: "expense",
    desc: "Monthly Rent",
  },
  {
    id: 3,
    date: "2026-03-10",
    category: "Food",
    amount: 450,
    type: "expense",
    desc: "Groceries",
  },
];

let currentRole = "admin";
let sortConfig = { key: "date", direction: "desc" };


function init() {
 
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  handleRoleChange("admin");
  renderAll();
}


const themeBtn = document.getElementById("theme-toggle");

function updateThemeIcon(theme) {
  themeBtn.innerHTML =
    theme === "dark"
      ? '<i class="fas fa-moon"></i>'
      : '<i class="fas fa-moon"></i>';
}

themeBtn.onclick = () => {
  const current = document.body.getAttribute("data-theme");
  const newTheme = current === "dark" ? "light" : "dark";

  document.body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  updateThemeIcon(newTheme);
};


function renderAll() {
  calculateSummary();
  renderTable();
  renderVisuals();
  renderInsights();

  localStorage.setItem("ff_data", JSON.stringify(transactions));
}


function calculateSummary() {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  document.getElementById("stat-income").textContent =
    `₹${income.toLocaleString("en-IN")}`;
  document.getElementById("stat-expenses").textContent =
    `₹${expense.toLocaleString("en-IN")}`;
  document.getElementById("stat-balance").textContent =
    `₹${(income - expense).toLocaleString("en-IN")}`;
}


function renderTable() {
  const tbody = document.getElementById("table-body");
  const filterType = document.getElementById("type-filter").value;
  const search = document.getElementById("search-input").value.toLowerCase();

  let filtered = transactions.filter((t) => {
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesSearch =
      t.desc.toLowerCase().includes(search) ||
      t.category.toLowerCase().includes(search);
    return matchesType && matchesSearch;
  });


  filtered.sort((a, b) => {
    if (sortConfig.key === "date") {
      return sortConfig.direction === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    }

    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;

    return 0;
  });

  tbody.innerHTML = filtered
    .map(
      (t) => `
      <tr>
        <td>${t.date}</td>
        <td>${t.category}</td>
        <td class="${t.type === "income" ? "text-success" : "text-danger"}">
          ${t.type === "income" ? "+" : "-"}₹${t.amount.toLocaleString("en-IN")}
        </td>
        <td><span class="badge-${t.type}">${t.type}</span></td>
        <td class="admin-only">
          <button onclick="deleteItem(${t.id})" class="icon-btn">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `
    )
    .join("");

  document.getElementById("empty-state").className =
    filtered.length ? "hidden" : "empty-msg";
}


function renderVisuals() {
  const container = document.getElementById("category-bars");
  const expenses = transactions.filter((t) => t.type === "expense");
  const totals = {};

  expenses.forEach(
    (t) => (totals[t.category] = (totals[t.category] || 0) + t.amount)
  );

  const max = Math.max(...Object.values(totals), 1);

  container.innerHTML = Object.entries(totals)
    .map(
      ([cat, amt]) => `
      <div class="viz-row">
        <span style="width: 80px">${cat}</span>
        <div class="bar-bg">
          <div class="bar-fill" style="width: ${(amt / max) * 100}%"></div>
        </div>
        <span>₹${amt.toLocaleString("en-IN")}</span>
      </div>
    `
    )
    .join("");
}


function renderInsights() {
  const list = document.getElementById("insights-list");
  const expenses = transactions.filter((t) => t.type === "expense");

  if (expenses.length === 0) {
    list.innerHTML = "Add expenses to see insights.";
    return;
  }

  const totals = {};
  expenses.forEach(
    (t) => (totals[t.category] = (totals[t.category] || 0) + t.amount)
  );

  const highest = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];

  list.innerHTML = `
    <div class="insight-item">
      <i class="fas fa-lightbulb text-success"></i>
      <p>Highest spending: <strong>${highest[0]}</strong> (₹${highest[1].toLocaleString("en-IN")})</p>
    </div>
    <div class="insight-item">
      <i class="fas fa-chart-line text-primary"></i>
      <p>Total transactions: <strong>${transactions.length}</strong></p>
    </div>
  `;
}


function handleRoleChange(role) {
  currentRole = role;
  document.body.className = `role-${role}`;
  document.getElementById("role-display").textContent =
    `Role: ${role.toUpperCase()}`;
  renderAll();
}


function handleSort(key) {
  sortConfig.direction =
    sortConfig.key === key && sortConfig.direction === "desc" ? "asc" : "desc";
  sortConfig.key = key;
  renderAll();
}

function deleteItem(id) {
  if (currentRole !== "admin") return;

  if (!confirm("Delete this transaction?")) return;

  transactions = transactions.filter((t) => t.id !== id);
  renderAll();
}

function openModal() {
  document.getElementById("addModal").style.display = "block";
}

function closeModal() {
  document.getElementById("addModal").style.display = "none";
}

document.getElementById("trans-form").onsubmit = (e) => {
  e.preventDefault();

  const amount = parseFloat(document.getElementById("f-amount").value);
  const desc = document.getElementById("f-desc").value.trim();
  const category = document.getElementById("f-category").value;
  const type = document.getElementById("f-type").value;
  const date = document.getElementById("f-date").value;

  if (!amount || amount <= 0) {
    alert("Enter valid amount!");
    return;
  }

  if (!desc) {
    alert("Description required!");
    return;
  }

  if (!date) {
    alert("Select a date!");
    return;
  }

  const newTrans = {
    id: Date.now(),
    amount,
    desc,
    category,
    type,
    date,
  };

  transactions.push(newTrans);
  renderAll();
  closeModal();
  e.target.reset();
};

function exportData(format) {
  if (format !== "csv") return;

  const rows = [
    ["Date", "Category", "Amount", "Type", "Description"],
    ...transactions.map((t) => [
      t.date,
      t.category,
      t.amount,
      t.type,
      t.desc,
    ]),
  ];

  const csv = rows.map((r) => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "transactions.csv";
  a.click();
}

init();