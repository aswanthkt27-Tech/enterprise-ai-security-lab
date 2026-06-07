// =====================================================
// PostgreSQL Database Configuration
// Enterprise AI Security Lab
// =====================================================
//
// Creates a reusable PostgreSQL connection pool.
// This connects the backend to Supabase PostgreSQL using DATABASE_URL.

const { Pool } = require("pg");

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Supabase requires SSL for external database connections.
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test function to verify Supabase connectivity
const testPostgresConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("Connected to Supabase PostgreSQL:", result.rows[0].now);
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
  }
};

module.exports = {
  pool,
  testPostgresConnection,
};