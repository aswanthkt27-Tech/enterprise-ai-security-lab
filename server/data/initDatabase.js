const db = require("../config/database");

db.serialize(() => {

  db.run(`

    CREATE TABLE IF NOT EXISTS employees (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      employee_id TEXT UNIQUE,

      name TEXT,

      email TEXT UNIQUE,

      phone TEXT,

      role TEXT,

      department TEXT,

      leave_balance INTEGER,

      salary INTEGER,

      location TEXT

    )

  `);

  console.log("Employees table created successfully");

    db.run(`

    INSERT OR IGNORE INTO employees
    (
      employee_id,
      name,
      email,
      phone,
      role,
      department,
      leave_balance,
      salary,
      location
    )

    VALUES

    (
      'EMP001',
      'Rahul Menon',
      'rahul@company.com',
      '9876543210',
      'Developer',
      'Engineering',
      12,
      80000,
      'Kochi'
    ),

    (
      'EMP002',
      'Anjali Nair',
      'anjali@company.com',
      '9876543211',
      'HR',
      'Human Resources',
      18,
      90000,
      'Bangalore'
    ),

    (
      'EMP003',
      'Vivek Sharma',
      'vivek@company.com',
      '9876543212',
      'Manager',
      'Engineering',
      20,
      120000,
      'Mumbai'
    ),

    (
      'EMP004',
      'Sneha Iyer',
      'sneha@company.com',
      '9876543213',
      'Security Analyst',
      'Cyber Security',
      15,
      95000,
      'Hyderabad'
    )

  `);

  console.log("Mock employees inserted successfully");

});