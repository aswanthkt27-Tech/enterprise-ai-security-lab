const db = require("../config/database");

// Authentication middleware
const fakeLoggedInUser = (req, res, next) => {

  // Extract employee ID from request header
  const employeeId = req.headers["x-employee-id"];

  // Block request if employee ID header is missing
  if (!employeeId) {

    return res.status(401).json({

      message: "Missing employee identity"

    });

  }

  // Fetch employee from database
  db.get(

    "SELECT * FROM employees WHERE employee_id = ?",

    [employeeId],

    (error, employee) => {

      if (error) {

        return res.status(500).json({

          error: error.message

        });

      }

      // Block invalid employee identities
      if (!employee) {

        return res.status(401).json({

          message: "Invalid employee identity"

        });

      }

      // Attach authenticated employee to request
      req.user = {

        employee_id: employee.employee_id,

        name: employee.name,

        role: employee.role,

        department: employee.department

      };

      console.log("Authenticated User:", req.user);

      next();

    }

  );

};

module.exports = fakeLoggedInUser;