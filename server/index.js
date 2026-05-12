require("dotenv").config();

const express = require("express");

const cors = require("cors");

const OpenAI = require("openai");

const db = require("./config/database");

const employeeRoutes = require("./routes/employeeRoutes");

const fakeLoggedInUser = require("./middleware/authMiddleware");

const app = express();

const PORT = process.env.PORT || 3000;

// OpenAI client configuration
const client = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY

});

app.use(cors());

app.use(express.json());

app.use(fakeLoggedInUser);

app.use(employeeRoutes);

app.get("/", (req, res) => {

  res.send("Enterprise AI Security Backend Running");

});

// AI chatbot endpoint
app.post("/chat", async (req, res) => {

  try {

    // Extract logged-in employee from middleware
    const loggedInEmployee = req.user;

    // Extract employee question from request body
    const userMessage = req.body.message;

    // Fetch employee details from database
    db.get(

      "SELECT * FROM employees WHERE employee_id = ?",

      [loggedInEmployee.employee_id],

      async (error, employee) => {

        if (error) {

          return res.status(500).json({

            error: error.message

          });

        }

        // Build employee-specific context for AI
        const employeeContext = `
Employee Details:
Name: ${employee.name}
Role: ${employee.role}
Department: ${employee.department}
Leave Balance: ${employee.leave_balance}
Location: ${employee.location}
`;

        // Send secure enterprise prompt to AI
        const completion = await client.chat.completions.create({

          model: "gpt-4.1-mini",

          messages: [

            {
              role: "system",

              content: `
You are a secure enterprise HR assistant.

Rules:
- Only answer questions related to the logged-in employee.
- Never reveal information about other employees.
- Refuse unauthorized access requests.
- Be professional and concise.
`
            },

            {
              role: "system",

              content: employeeContext
            },

            {
              role: "user",

              content: userMessage
            }

          ]

        });

        // Extract AI response
        const aiReply = completion.choices[0].message.content;

        // Send AI response back to employee
        res.json({

          reply: aiReply

        });

      }

    );

  } catch (error) {

    console.error(error);

    res.status(500).json({

      error: "Something went wrong"

    });

  }

});

app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});