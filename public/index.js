document.addEventListener("DOMContentLoaded", () => {
  // Connect to Socket.io server
  const socket = io();
  const repl = document.getElementById("repl");

  // Use Event Delegation on the 'repl' container for keydown
  repl.addEventListener("keydown", function (event) {
    if (event.target.classList.contains("input-el") && event.key === "Enter") {
      event.preventDefault();

      const inputEl = event.target;
      const command = inputEl.value.trim();

      if (command.toLowerCase() === "clear") {
        deleteAllInputLines();
        addNextInputLine();
        return;
      }

      if (command) {
        // 1. Transform active input into a static history line
        displayCommandHistory(command, inputEl);

        // 2. Send message to backend
        socket.emit("command", {
          command: command,
          timestamp: new Date().toISOString(),
        });
      } else {
        addNextInputLine();
      }
    } else if (event.ctrlKey && event.key === "l") {
      event.preventDefault();
      deleteAllInputLines();
      addNextInputLine();
    }
  });

  function deleteAllInputLines() {
    const allInputLines = document.querySelectorAll(".input-line");
    allInputLines.forEach((e) => e.remove());
    const results = document.querySelectorAll(
      ".terminal-result, .terminal-error, .terminal-welcome"
    );
    results.forEach((e) => e.remove());
  }

  function addNextInputLine() {
    const existingActive = document.querySelectorAll(
      ".input-el:not([disabled])"
    );
    existingActive.forEach((el) => el.parentElement.remove());

    const inputDiv = document.createElement("div");
    inputDiv.className = "input-line";

    const span = document.createElement("span");
    span.innerText = "> ";

    const input = document.createElement("input");
    input.className = "input-el";
    input.setAttribute("autofocus", "");

    inputDiv.appendChild(span);
    inputDiv.appendChild(input);

    repl.appendChild(inputDiv);

    setTimeout(() => input.focus(), 0);
    inputDiv.scrollIntoView({ behavior: "smooth" });
  }

  function displayCommandHistory(command, inputElement) {
    const parentDiv = inputElement.parentElement;

    const historyDiv = document.createElement("div");
    historyDiv.className = "input-line command-history";

    const span = document.createElement("span");
    span.innerText = "> ";

    const staticInput = document.createElement("input");
    staticInput.className = "input-el";
    staticInput.value = command;
    staticInput.disabled = true;
    staticInput.style.color = "#6ee7b7";

    historyDiv.appendChild(span);
    historyDiv.appendChild(staticInput);

    parentDiv.replaceWith(historyDiv);
    return historyDiv;
  }

  function displayResult(result, isError = false) {
    const resultDiv = document.createElement("div");
    resultDiv.className = isError ? "terminal-error" : "terminal-result";

    // --- NEW Table Formatting Logic ---
    if (typeof result === "string") {
      resultDiv.innerText = result;
    } else if (typeof result === "object") {
      if (Array.isArray(result)) {
        if (result.length === 0) {
          resultDiv.innerText = "0 rows returned";
        } else {
          // Create HTML Table for cleaner alignment
          const table = document.createElement("table");
          table.className = "terminal-table";

          const headers = Object.keys(result[0]);
          const trHead = document.createElement("tr");

          headers.forEach((h) => {
            const th = document.createElement("th");
            th.innerText = h.toUpperCase();
            trHead.appendChild(th);
          });
          table.appendChild(trHead);

          result.forEach((row) => {
            const tr = document.createElement("tr");
            headers.forEach((h) => {
              const td = document.createElement("td");
              td.innerText = row[h] ?? "NULL";
              tr.appendChild(td);
            });
            table.appendChild(tr);
          });
          resultDiv.appendChild(table);
        }
      } else {
        resultDiv.innerText = JSON.stringify(result, null, 2);
      }
    } else {
      resultDiv.innerText = String(result);
    }

    // --- Insertion Logic ---
    const histories = document.querySelectorAll(".command-history");
    const lastHistory = histories[histories.length - 1];

    if (lastHistory) {
      lastHistory.after(resultDiv);
    } else {
      repl.appendChild(resultDiv);
    }

    addNextInputLine();
  }

  // ============ SOCKET.IO EVENT LISTENERS ============

  socket.on("welcome", (data) => {
    deleteAllInputLines();
    const messageElement = document.createElement("div");
    messageElement.className = "terminal-welcome";
    messageElement.innerText = data.message;
    repl.appendChild(messageElement);
    addNextInputLine();
  });

  socket.on("command_result", (data) => {
    if (data.success) {
      displayResult(data.result, false);
    } else {
      displayResult(data.error || "Unknown error", true);
    }
  });

  socket.on("command_error", (data) => {
    displayResult(`Error: ${data.error || "An unknown error occurred"}`, true);
  });

  const handleSystemMessage = (msg, isError = false) => {
    const div = document.createElement("div");
    div.className = isError ? "terminal-error" : "terminal-system";
    div.innerText = msg;
    repl.appendChild(div);
    repl.scrollTop = repl.scrollHeight;
    if (!document.querySelector(".input-el:not([disabled])")) {
      addNextInputLine();
    }
  };

  socket.on("user_disconnected", (data) => handleSystemMessage(data.message));
  socket.on("connect_error", () =>
    handleSystemMessage("Connection error. Please refresh.", true)
  );
  socket.on("disconnect", () =>
    handleSystemMessage("Disconnected. Reconnecting...", true)
  );
});
