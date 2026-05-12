const sqlite3 = require("sqlite3").verbose();

const path = require("path");

const dbPath = path.join(__dirname, "../../employee.db");

const db = new sqlite3.Database(dbPath, (error) => {

  if (error) {

    console.log("Database Connection Error:", error.message);

  } else {

    console.log("Connected to SQLite Database");

  }

});

module.exports = db;