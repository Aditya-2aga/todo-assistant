// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import todoRoutes from './routes/todos.js';
// The db.js doesn't export a default, but its execution initializes the supabase client.
// We import it here to ensure it runs and initializes supabase client if it hasn't already.
import './db.js'; 
import cors from 'cors';
app.use(cors());


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
// Enable CORS for all routes and origins (for development)
// For production, configure specific origins: app.use(cors({ origin: 'https://your-frontend-domain.com' }));
app.use(cors()); 
app.use(express.json()); // Parse JSON request bodies

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Todo Summary Assistant Backend is running!');
});

app.use('/api/todos', todoRoutes); // All todo related routes are under /api/todos

// --- Global Error Handler (Optional basic example) ---
// This is a very basic error handler. For production, you'd want more robust error logging and handling.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send('Something broke!');
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);

  // Log environment variables (BE CAREFUL with sensitive data in production logs)
  // console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Loaded' : 'NOT LOADED');
  // console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Loaded' : 'NOT LOADED');
  // console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Loaded' : 'NOT LOADED');
  // console.log('SLACK_WEBHOOK_URL:', process.env.SLACK_WEBHOOK_URL ? 'Loaded' : 'NOT LOADED');
});
