// =====================================================
// Employee Routes
// Enterprise AI Security Lab
// =====================================================
//
// These routes fetch employee data from Supabase PostgreSQL.
// RBAC checks are handled in the backend before sending data.

const express = require("express");

const router = express.Router();

const { pool } = require("../config/database-postgres");

// Safe employee fields only.
// Do not expose salary, internal notes, secrets, or other sensitive fields.
const SAFE_EMPLOYEE_FIELDS = `
  employee_id,
  name,
  role,
  department,
  leave_balance,
  location
`;

// Get employees with RBAC filtering
router.get("/employees", async (req, res) => {
  try {
    if (!req.user || !req.user.employee_id) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    let result;

    // HR can view all basic employee records
    if (req.user.role === "HR") {
      result = await pool.query(`
        SELECT ${SAFE_EMPLOYEE_FIELDS}
        FROM employees
        ORDER BY employee_id
      `);
    }

    // Managers can view employees from their own department only
    else if (req.user.role === "Manager") {
      result = await pool.query(
        `
        SELECT ${SAFE_EMPLOYEE_FIELDS}
        FROM employees
        WHERE department = $1
        ORDER BY employee_id
        `,
        [req.user.department]
      );
    }

    // Normal employees cannot list all employees
    else {
      return res.status(403).json({
        message: "Access denied. Employees list is restricted.",
      });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching employees:", error.message);

    res.status(500).json({
      error: "Failed to fetch employees",
    });
  }
});

// Get employee by ID with RBAC check
router.get("/employee/:employeeId", async (req, res) => {
  try {
    if (!req.user || !req.user.employee_id) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    const employeeId = req.params.employeeId;

    const result = await pool.query(
      `
      SELECT ${SAFE_EMPLOYEE_FIELDS}
      FROM employees
      WHERE employee_id = $1
      `,
      [employeeId]
    );

    const employee = result.rows[0];

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const isOwner = req.user.employee_id === employeeId;
    const isHR = req.user.role === "HR";
    const isManager = req.user.role === "Manager";
    const sameDepartment = req.user.department === employee.department;

    if (!isOwner && !isHR && !(isManager && sameDepartment)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
      });
    }

    res.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error.message);

    res.status(500).json({
      error: "Failed to fetch employee",
    });
  }
});

module.exports = router;
