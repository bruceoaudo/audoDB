# AudoDB REPL (Read-Eval-Print Loop)

## 1. Overview

The AudoDB REPL is a real-time, web-based administrative terminal. It allows developers to interact directly with the database engine using raw SQL queries. Unlike traditional command-line interfaces, this REPL is built with a **Client-Server Architecture** using **Socket.io**, enabling instant communication between the browser and the core engine.

## 2. Why a Web-Based REPL?

I chose to build the REPL using web technologies (HTML/JS/Socket.io) instead of a traditional terminal interface for several key reasons:
- **Zero Installation:** Developers don't need to install a specific CLI tool. They can access the full power of the database directly from a browser tab at /audodb-admin.
- **Rich Data Formatting:** While terminals are limited to plain text, a web-based REPL can detect result sets and automatically render them as clean, readable HTML Tables.
- **Asynchronous Communication:** By using Sockets, the REPL remains responsive even during complex queries. The UI doesn't "freeze" while waiting for a result.

## 3. How it Works (The Event Loop)

The REPL operates on a simple but effective event-driven cycle:
1. **Input:** The user types a SQL command into the ```.input-el``` and hits Enter.
2. **Emission:** The frontend emits a ```command``` event via **Socket.io**, sending the string to the backend.
3. **Execution:** The ```AudoDB``` class receives the event, passes the string to the ```Interpreter```, and captures the return value.
4. **Broadcast:** The server emits a ```command_result``` back to the specific client.
5. **Rendering:** The frontend receives the JSON result. If it's an array (a result set), it dynamically builds an HTML table; if it's a message, it prints it as text.

## 4. Pros and Cons

####Pros

- **Accessibility:** Accessible from any device with a browser.
- **Visual Clarity:** Better visualization of data relationships through tables rather than the messy text alignment often found in terminals.
- **Integration:** Can be attached to any existing Express server with a single line of code (db.attachAdminUI(app, server)).

#### Cons
- **Network Dependency:** Unlike a local CLI, the REPL requires a stable connection to the server.

- **Security Risk:** If not properly protected by middleware, a web-based REPL could expose raw database access to unauthorized users.
- **DOM Overhead:** Excessive command history can eventually slow down the browser tab, requiring a "Clear" command.

## 5. REPL Features

- **Auto-Focusing:** The interface ensures the input line is always ready for typing.
- **Scroll-to-View:** Long result sets automatically scroll the window to the newest prompt.
- **Keyboard Shortcuts:** Supports Ctrl + L for quick terminal clearing.
- **Table Mapping**: Automatically maps JSON keys to table headers for SELECT queries.

## 6. Future Improvements

- **Command History (Up/Down Arrow):** Implementing a buffer to allow users to navigate through previously typed commands using arrow keys.
- **Syntax Highlighting:** Integrating a library like CodeMirror to highlight SQL keywords (SELECT, FROM, WHERE) as the user types.
- **Authentication Layer:** Adding a login requirement before the attachAdminUI route can be accessed.
- **Export Options:** Adding buttons to results to export the returned data as CSV or JSON directly from the terminal.

## Final Integration Note

The REPL is powered by the same ```Interpreter``` instance as the programmatic API. This means that any table you create via the REPL is immediately available to your backend code, and vice-versa, ensuring a "single source of truth" for your data.