// =====================================================
// Temporary Authentication Middleware
// Enterprise AI Security Lab
// =====================================================
//
// This middleware uses x-employee-id from the request header
// to simulate an authenticated employee.
//
// Later, this will be replaced with Keycloak token validation.

const { pool } = require("../config/database-postgres");

const fakeLoggedInUser = async (req, res, next) => {
  try {
    // Extract employee ID from request header
    const employeeId = req.headers["x-employee-id"];

    // Block request if employee ID header is missing
    if (!employeeId) {
      return res.status(401).json({
        message: "Missing employee identity",
      });
    }

    // Fetch employee from Supabase PostgreSQL
    // Only fetch fields required for authentication and RBAC.
    const result = await pool.query(
      `
      SELECT employee_id, name, role, department
      FROM employees
      WHERE employee_id = $1
      `,
      [employeeId]
    );

    const employee = result.rows[0];

    // Block invalid employee identities
    if (!employee) {
      return res.status(401).json({
        message: "Invalid employee identity",
      });
    }

    // Attach authenticated employee to request
    req.user = {
      employee_id: employee.employee_id,
      name: employee.name,
      role: employee.role,
      department: employee.department,
    };

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error.message);

    res.status(500).json({
      error: "Authentication failed",
    });
  }
};

module.exports = fakeLoggedInUser;
