
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import todoRoutes from './routes/todos.js';
import './db.js'; 


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('Todo Summary Assistant Backend is running!');
});

app.use('/api/todos', todoRoutes); 

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
