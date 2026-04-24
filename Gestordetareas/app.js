// ==========================================
// app.js - Gestor de Tareas
// ==========================================

// VULNERABILITY 1: Hardcoded credentials (Security Hotspot / Bug)
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";  // sonar: hardcoded password

// VULNERABILITY 2: Unused variables (Code Smell)
var unusedCounter = 0;
var debugMode = true;
var tempData = null;

// Global state
var tasks = [];
var currentUser = null;

// ==========================================
// AUTHENTICATION
// ==========================================

function login() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  // VULNERABILITY 3: Insecure comparison (no hashing)
  if (username == ADMIN_USER && password == ADMIN_PASS) {
    currentUser = username;

    // VULNERABILITY 4: Storing sensitive data in localStorage without encryption
    localStorage.setItem("user", username);
    localStorage.setItem("password", password); // storing plain password

    document.getElementById("login-section").style.display = "none";
    document.getElementById("app-section").style.display = "block";

    // VULNERABILITY 5: XSS - inserting user input directly into innerHTML
    document.getElementById("username-display").innerHTML = username;

    loadTasks();
  } else {
    document.getElementById("login-error").innerHTML =
      "Credenciales incorrectas para: " + username; // XSS vulnerability
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem("user");
  localStorage.removeItem("password");
  document.getElementById("login-section").style.display = "block";
  document.getElementById("app-section").style.display = "none";
}

// ==========================================
// TASK MANAGEMENT
// ==========================================

function addTask() {
  var taskText  = document.getElementById("task-input").value;
  var category  = document.getElementById("task-category").value;

  // VULNERABILITY 6: No input validation / sanitization
  if (taskText) {
    var task = {
      id:        new Date().getTime(),
      text:      taskText,
      category:  category,
      done:      false,
      createdAt: new Date()
    };

    tasks.push(task);
    saveTasks();
    renderTasks(tasks);

    document.getElementById("task-input").value = "";
    document.getElementById("task-category").value = "";
  }
}

function deleteTask(id) {
  tasks = tasks.filter(function(t) { return t.id !== id; });
  saveTasks();
  renderTasks(tasks);
}

function toggleTask(id) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].done = !tasks[i].done;
    }
  }
  saveTasks();
  renderTasks(tasks);
}

// ==========================================
// RENDER
// ==========================================

function renderTasks(list) {
  var ul = document.getElementById("task-list");
  ul.innerHTML = "";

  for (var i = 0; i < list.length; i++) {
    var t = list[i];

    // VULNERABILITY 7: XSS - building HTML with unsanitized user data
    ul.innerHTML += "<li id='task-" + t.id + "'>" +
      "<input type='checkbox' " + (t.done ? "checked" : "") +
      " onchange='toggleTask(" + t.id + ")'>" +
      "<span class='" + (t.done ? "done" : "") + "'>" + t.text + "</span>" +
      " <em>[" + t.category + "]</em>" +
      " <button onclick='deleteTask(" + t.id + ")'>Eliminar</button>" +
      "</li>";
  }

  updateStats();
}

// ==========================================
// SEARCH
// ==========================================

function searchTask() {
  var query = document.getElementById("search-input").value;

  // VULNERABILITY 8: Using eval() for filtering (dangerous)
  var filtered = tasks.filter(function(t) {
    return eval('"' + t.text + '".toLowerCase().includes("' + query.toLowerCase() + '")');
  });

  renderTasks(filtered);
}

// ==========================================
// STATS
// ==========================================

function updateStats() {
  var total = tasks.length;
  var done  = tasks.filter(function(t) { return t.done; }).length;

  // VULNERABILITY 9: Duplicate code (Code Smell)
  document.getElementById("total-tasks").innerHTML = total;
  document.getElementById("done-tasks").innerHTML  = done;
}

// ==========================================
// STORAGE
// ==========================================

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  var stored = localStorage.getItem("tasks");
  if (stored) {
    tasks = JSON.parse(stored);
    renderTasks(tasks);
  }
}

// ==========================================
// DEAD CODE - functions never called (Code Smell)
// ==========================================

function exportData() {
  // This function is never called
  var data = JSON.stringify(tasks);
  console.log("Exporting:", data);
}

function debugLog(msg) {
  // Dead code
  if (debugMode) {
    console.log("[DEBUG]", msg);
  }
}

function resetAll() {
  // Dead code - never used
  tasks = [];
  unusedCounter = 0;
  tempData = null;
  localStorage.clear();
}

// VULNERABILITY 10: Using setTimeout with string (eval equivalent)
setTimeout("console.log('App loaded')", 100);
