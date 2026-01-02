// ------------------ Data ------------------
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editingTransactionIndex = null;
let editingAccountIndex = null;

// ------------------ Hamburger Menu ------------------
function toggleMenu() {
  document.getElementById("slideMenu").classList.toggle("show");
}
function closeMenu(){
  document.getElementById("slideMenu").classList.remove("show");
}

// ------------------ Tabs ------------------
function showTab(tabName) {
  const tabs = document.querySelectorAll(".tab-content");
  tabs.forEach(tab => tab.style.display = "none");
  document.getElementById(tabName).style.display = "block";

  const buttons = document.querySelectorAll(".bottom-tabs button");
  buttons.forEach(btn => btn.classList.remove("active"));
  if(tabName === "home") buttons[0].classList.add("active");
  if(tabName === "transactions") buttons[1].classList.add("active");
  if(tabName === "charts") buttons[2].classList.add("active");
}

// ------------------ Home ------------------
function renderHome() {
  const net = accounts.reduce((sum, acc)=> sum + acc.balance,0);
  document.getElementById("netWorth").textContent = `₹${net}`;

  const list = document.getElementById("accountsList");
  list.innerHTML = "";
  accounts.forEach(acc=>{
    const li = document.createElement("li");
    li.textContent = `${acc.name} (${acc.type}) : ₹${acc.balance}`;
    list.appendChild(li);
  });

  renderMenuAccounts();
}

// ------------------ Manage Accounts ------------------
function addAccount() {
  const name = document.getElementById("newAccountName").value;
  const type = document.getElementById("newAccountType").value;

  if(!name) return alert("Enter account name");

  if(editingAccountIndex !== null){
    accounts[editingAccountIndex].name = name;
    accounts[editingAccountIndex].type = type;
    editingAccountIndex = null;
  } else {
    accounts.push({name,type,balance:0});
  }

  localStorage.setItem("accounts", JSON.stringify(accounts));
  document.getElementById("newAccountName").value = "";
  renderHome();
  renderTransactionAccounts();
}

function editAccount(index){
  document.getElementById("newAccountName").value = accounts[index].name;
  document.getElementById("newAccountType").value = accounts[index].type;
  editingAccountIndex = index;
}

function deleteAccount(index){
  if(!confirm("Delete this account?")) return;
  // Remove transactions linked to this account
  transactions = transactions.filter(t=> t.account !== accounts[index].name);
  accounts.splice(index,1);
  localStorage.setItem("accounts", JSON.stringify(accounts));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderHome();
  renderTransactions();
}

function renderMenuAccounts(){
  const list = document.getElementById("menuAccountsList");
  list.innerHTML = "";
  accounts.forEach((acc,index)=>{
    const li = document.createElement("li");
    li.innerHTML = `${acc.name} (${acc.type}) 
      <button class="edit-btn" onclick="editAccount(${index})">Edit</button>
      <button class="delete-btn" onclick="deleteAccount(${index})">Delete</button>`;
    list.appendChild(li);
  });
}

// ------------------ Transactions ------------------
function showTransactionForm(editIndex=null){
  if(accounts.length===0) return alert("Create an account first");
  document.getElementById("transactionPopup").style.display = "flex";
  editingTransactionIndex = editIndex;
  renderTransactionAccounts();

  if(editIndex!==null){
    const t = transactions[editIndex];
    document.getElementById("transDate").value = t.date;
    document.getElementById("transAccount").value = accounts.findIndex(a=> a.name===t.account);
    document.getElementById("transType").value = t.type;
    document.getElementById("transAmount").value = t.amount;
    document.getElementById("transactionTitle").textContent = "Edit Transaction";
  } else {
    document.getElementById("transDate").value="";
    document.getElementById("transAmount").value="";
    document.getElementById("transactionTitle").textContent = "Add Transaction";
  }
}

function closeTransactionForm(){
  document.getElementById("transactionPopup").style.display = "none";
}

function renderTransactionAccounts(){
  const select = document.getElementById("transAccount");
  select.innerHTML="";
  accounts.forEach((acc,index)=>{
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${acc.name} (${acc.type})`;
    select.appendChild(option);
  });
}

function saveTransaction(){
  const date = document.getElementById("transDate").value;
  const accIndex = Number(document.getElementById("transAccount").value);
  const type = document.getElementById("transType").value;
  const amount = Number(document.getElementById("transAmount").value);

  if(!date || accIndex===null || !type || !amount) return alert("Fill all fields");

  if(editingTransactionIndex !== null){
    // Reverse old transaction balance
    const old = transactions[editingTransactionIndex];
    const oldAccIndex = accounts.findIndex(a=>a.name===old.account);
    accounts[oldAccIndex].balance += old.type==="Expense"? old.amount: -old.amount;

    // Update transaction
    transactions[editingTransactionIndex] = {date, account: accounts[accIndex].name, type, amount};
  } else {
    transactions.push({date, account: accounts[accIndex].name, type, amount});
  }

  // Update account balance
  accounts[accIndex].balance += type==="Income"? amount: -amount;

  localStorage.setItem("accounts", JSON.stringify(accounts));
  localStorage.setItem("transactions", JSON.stringify(transactions));

  editingTransactionIndex = null;
  closeTransactionForm();
  renderHome();
  renderTransactions();
}

function renderTransactions(){
  const list = document.getElementById("transactionList");
  list.innerHTML="";
  transactions.forEach((t,index)=>{
    const li = document.createElement("li");
    li.innerHTML = `${t.date} | ${t.account} | ${t.type} | ₹${t.amount}
      <button class="edit-btn" onclick="showTransactionForm(${index})">Edit</button>
      <button class="delete-btn" onclick="deleteTransaction(${index})">Delete</button>`;
    list.appendChild(li);
  });
}

function deleteTransaction(index){
  if(!confirm("Delete this transaction?")) return;
  const t = transactions[index];
  const accIndex = accounts.findIndex(a=> a.name===t.account);
  accounts[accIndex].balance += t.type==="Expense"? t.amount : -t.amount;
  transactions.splice(index,1);
  localStorage.setItem("accounts", JSON.stringify(accounts));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderHome();
  renderTransactions();
}

// ------------------ Initialize ------------------
renderHome();
renderTransactions();
showTab("home");
function resetAppData() {
  if (confirm("This will delete all accounts and transactions. Continue?")) {
    localStorage.clear();
    location.reload();
  }
}