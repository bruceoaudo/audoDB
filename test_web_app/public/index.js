// Global state to track if we are adding or editing
let isEditMode = false;

// Navigation logic
function showSection(e, sectionId) {
  document
    .querySelectorAll("main section")
    .forEach((s) => s.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");

  document
    .querySelectorAll("nav li")
    .forEach((li) => li.classList.remove("active"));

  if (e && e.currentTarget) {
    e.currentTarget.classList.add("active");
  }

  if (sectionId === "users-section") fetchUsers();
  if (sectionId === "orders-section") fetchOrders();
  if (sectionId === "reports-section") fetchJoinReport();
}

// --- USER MANAGEMENT ---

async function fetchUsers() {
  const res = await fetch("/api/users");
  const data = await res.json();
  const tbody = document.querySelector("#usersTable tbody");

  tbody.innerHTML = data
    .map(
      (u) => `
        <tr>
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>
                <button onclick="editUser(${u.id}, '${u.name}', '${u.email}')" style="color:blue; background:none; border:none; cursor:pointer; margin-right:10px">Update</button>
                <button onclick="deleteUser(${u.id})" style="color:red; background:none; border:none; cursor:pointer">Delete</button>
            </td>
        </tr>
    `
    )
    .join("");
}

// Pre-populate the modal for editing
function editUser(id, name, email) {
  isEditMode = true;
  document.querySelector("#user-modal h3").innerText = "Update User";

  const idField = document.getElementById("userId");
  idField.value = id;
  idField.disabled = true; // Block ID changes during update

  document.getElementById("userName").value = name;
  document.getElementById("userEmail").value = email;

  openModal("user-modal");
}

// Reset modal for fresh entry
function openAddUserModal() {
  isEditMode = false;
  document.querySelector("#user-modal h3").innerText = "Add New User";

  const idField = document.getElementById("userId");
  idField.value = "";
  idField.disabled = false;

  document.getElementById("userName").value = "";
  document.getElementById("userEmail").value = "";

  openModal("user-modal");
}

async function saveUser() {
  const id = document.getElementById("userId").value;
  const payload = {
    id: id,
    name: document.getElementById("userName").value,
    email: document.getElementById("userEmail").value,
  };

  // Switch between POST (Add) and PUT (Update)
  const url = isEditMode ? `/api/users/${id}` : "/api/users";
  const method = isEditMode ? "PUT" : "POST";

  await fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  closeModal("user-modal");
  fetchUsers();
}

async function deleteUser(id) {
  if (!confirm("Delete user?")) return;
  await fetch(`/api/users/${id}`, { method: "DELETE" });
  fetchUsers();
}

// --- ORDER MANAGEMENT ---

async function fetchOrders() {
  try {
    const res = await fetch("/api/orders");
    const data = await res.json();

    if (!Array.isArray(data)) return;

    const tbody = document.querySelector("#ordersTable tbody");
    tbody.innerHTML = data
      .map(
        (o) => `
        <tr>
            <td>${o.id}</td>
            <td>${o.user_id}</td>
            <td>${o.product}</td>
            <td>$${o.price}</td>
        </tr>
    `
      )
      .join("");
  } catch (err) {
    console.error("Fetch orders failed", err);
  }
}

async function saveOrder() {
  const payload = {
    id: document.getElementById("orderId").value,
    user_id: document.getElementById("orderUserId").value,
    product: document.getElementById("orderProduct").value,
    price: document.getElementById("orderPrice").value,
  };

  await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  closeModal("order-modal");
  fetchOrders();
}

// --- REPORTS & UTILS ---

async function fetchJoinReport() {
  const res = await fetch("/api/reports/user-orders");
  const data = await res.json();

  if (!Array.isArray(data)) return;

  const tbody = document.querySelector("#reportsTable tbody");
  tbody.innerHTML = data
    .map(
      (o) => `
    <tr>
        <td>${o.name || "N/A"}</td> 
        <td>${o.product || "N/A"}</td> 
        <td>$${o.price || 0}</td>
    </tr>
`
    )
    .join("");
}

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

async function createIndex(table, col) {
  const res = await fetch(`/api/index/${table}/${col}`, { method: "POST" });
  const data = await res.json();
  alert(data.message || "Index Created!");
}

// Initial Load
window.onload = fetchUsers;
