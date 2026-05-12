const express = require("express");

const router = express.Router();

const db = require("../config/database");

router.get("/employees", (req, res) => {

  db.all("SELECT * FROM employees", [], (error, rows) => {

    if (error) {

      return res.status(500).json({

        error: error.message

      });

    }

    res.json(rows);

  });

});

router.get("/employee/:employeeId", (req, res) => {

  const employeeId = req.params.employeeId;

  console.log("Logged-in User:", req.user);


  db.get(

    "SELECT * FROM employees WHERE employee_id = ?",

    [employeeId],

    (error, row) => {

      if (error) {

        return res.status(500).json({

          error: error.message

        });

      }

      if (!row) {

        return res.status(404).json({

          message: "Employee not found"

        });

      }

            // Check if logged-in user owns the requested profile
      const isOwner = req.user.employee_id === employeeId;

      // Check if logged-in user is HR
      const isHR = req.user.role === "HR";

      // Check if logged-in user is a Manager
      const isManager = req.user.role === "Manager";

      // Check whether manager and employee belong to same department
      const sameDepartment = req.user.department === row.department;

      // Allow access only for:
      // 1. Profile owner
      // 2. HR employees
      // 3. Managers accessing employees from same department
      if (!isOwner && !isHR && !(isManager && sameDepartment)) {

        return res.status(403).json({

          message: "Access denied. Insufficient permissions."

        });

      }


      res.json(row);

    }

  );

});

module.exports = router;