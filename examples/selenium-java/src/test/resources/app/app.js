/*
 * Tiny app under test for the Selenium example. Runs from file:// with no server.
 * Small setTimeout delays are intentional: they simulate network latency so the tests
 * must use explicit waits instead of Thread.sleep or luck.
 */
var SaigeTodo = (function () {
  var ACCOUNTS = { tester: "Passw0rd!", locked_user: "Passw0rd!" };
  var LOCKED = { locked_user: true };

  function show(el, text) {
    el.textContent = text;
    el.hidden = false;
  }

  function initLogin() {
    var form = document.getElementById("login-form");
    var error = document.getElementById("login-error");
    var spinner = document.getElementById("login-spinner");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      error.hidden = true;
      var username = document.getElementById("username").value.trim();
      var password = document.getElementById("password").value;

      if (!username) return show(error, "Username is required");
      if (!password) return show(error, "Password is required");

      spinner.hidden = false;
      setTimeout(function () {
        spinner.hidden = true;
        if (ACCOUNTS[username] !== password) return show(error, "Invalid username or password");
        if (LOCKED[username]) return show(error, "This account is locked");
        window.location.href = "todos.html?user=" + encodeURIComponent(username);
      }, 400);
    });
  }

  function initTodos() {
    var params = new URLSearchParams(window.location.search);
    var user = params.get("user");
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    document.getElementById("welcome").textContent = "Welcome, " + user;

    var form = document.getElementById("todo-form");
    var input = document.getElementById("new-todo");
    var list = document.getElementById("todo-list");
    var error = document.getElementById("todo-error");
    var count = document.getElementById("todo-count");
    var nextId = 1;

    function updateCount() {
      var left = list.querySelectorAll("li:not(.done)").length;
      count.textContent = left + (left === 1 ? " item left" : " items left");
    }

    function addItem(text) {
      var id = nextId++;
      var li = document.createElement("li");
      li.setAttribute("data-testid", "todo-item");
      li.id = "todo-" + id;

      var box = document.createElement("input");
      box.type = "checkbox";
      box.setAttribute("aria-label", "Complete " + text);
      box.setAttribute("data-testid", "todo-toggle");
      box.addEventListener("change", function () {
        li.classList.toggle("done", box.checked);
        updateCount();
      });

      var label = document.createElement("span");
      label.className = "todo-text";
      label.setAttribute("data-testid", "todo-text");
      label.textContent = text;

      var del = document.createElement("button");
      del.type = "button";
      del.textContent = "Delete";
      del.setAttribute("aria-label", "Delete " + text);
      del.setAttribute("data-testid", "todo-delete");
      del.addEventListener("click", function () {
        li.remove();
        updateCount();
      });

      li.appendChild(box);
      li.appendChild(label);
      li.appendChild(del);
      list.appendChild(li);
      updateCount();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      error.hidden = true;
      var text = input.value.trim();
      if (!text) return show(error, "Todo text cannot be empty");
      var existing = Array.prototype.map.call(list.querySelectorAll(".todo-text"), function (n) {
        return n.textContent.toLowerCase();
      });
      if (existing.indexOf(text.toLowerCase()) !== -1) return show(error, "Todo already exists");
      input.value = "";
      setTimeout(function () {
        addItem(text);
      }, 250);
    });
  }

  return { initLogin: initLogin, initTodos: initTodos };
})();
