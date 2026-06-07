require("dotenv").config();

const express = require("express");
const cors = require("cors");

const OpenAI = require("openai");

// PostgreSQL connection pool
// Used by chatbot endpoint to fetch employee context from Supabase.
const { pool, testPostgresConnection } = require("./config/database-postgres");

const employeeRoutes = require("./routes/employeeRoutes");

const fakeLoggedInUser = require("./middleware/authMiddleware");

const app = express();

// Test Supabase PostgreSQL connection during server startup
testPostgresConnection();

const PORT = process.env.PORT || 3000;

// OpenAI client configuration
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Temporary authentication middleware
// Later this will be replaced with Keycloak token-based authentication.
app.use(fakeLoggedInUser);

// Employee API routes
app.use(employeeRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("Enterprise AI HR Chatbot Backend is running");
});

// =====================================================
// AI Chatbot Endpoint
// =====================================================
//
// This endpoint uses the authenticated employee identity
// and fetches employee context from Supabase PostgreSQL.
// The AI receives only the logged-in employee's allowed context.

app.post("/chat", async (req, res) => {
  try {
    // Extract logged-in employee from authentication middleware
    const loggedInEmployee = req.user;

    if (!loggedInEmployee || !loggedInEmployee.employee_id) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    // Extract employee question from request body
    const userMessage = req.body.message;

    // Validate user message before sending request to AI model
    if (!userMessage) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    // Fetch employee details from Supabase PostgreSQL
    // PostgreSQL uses $1, $2, etc. for parameterized queries.
    // This protects against SQL injection.
    const result = await pool.query(
      `
      SELECT employee_id, name, role, department, leave_balance, location
      FROM employees
      WHERE employee_id = $1
      `,
      [loggedInEmployee.employee_id]
    );

    const employee = result.rows[0];

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Build employee-specific context for AI
    // Only logged-in employee details are injected into the prompt.
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
- Answer only HR-related questions.
- Use only the authenticated employee context provided.
- Never reveal information about other employees.
- Refuse unauthorized access requests.
- Be professional and concise.
`,
        },
        {
          role: "system",
          content: employeeContext,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    // Extract AI response
    const aiReply = completion.choices[0].message.content;

    // Send AI response back to employee
    res.json({
      reply: aiReply,
    });
  } catch (error) {
    console.error("Chat endpoint error:", error.message);

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
