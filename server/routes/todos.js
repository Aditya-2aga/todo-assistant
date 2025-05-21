// server/routes/todos.js
import express from 'express';
import { supabase } from '../db.js';
import axios from 'axios'; // For Slack Webhook
// Note: Gemini API will be called using fetch, which is built-in to Node.js v18+
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// --- Helper function to call Gemini API ---
async function generateSummaryWithGemini(todosText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set.');
    throw new Error('Gemini API key not configured.');
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const prompt = `Please provide a concise summary of the following pending to-do items. Focus on the key tasks and overall workload. Do not include completed tasks in the summary. If there are no pending tasks, state that clearly. Pending tasks:\n\n${todosText}`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.5, // Adjust for creativity vs. factualness
      topK: 1,
      topP: 1,
      maxOutputTokens: 250, // Adjust as needed
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error Response:', errorBody);
      throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected Gemini API response structure:', result);
      throw new Error('Failed to parse summary from Gemini API response.');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error; // Re-throw to be caught by the route handler
  }
}


// --- API Endpoints ---

// GET /api/todos - Fetch all todos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching todos:', error);
      throw error;
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos', details: err.message });
  }
});

// POST /api/todos - Add a new todo
router.post('/', async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const { data, error } = await supabase
      .from('todos')
      .insert([{ title, completed: false }])
      .select() // Return the inserted row
      .single(); // Expect a single row back

    if (error) {
      console.error('Supabase error adding todo:', error);
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add todo', details: err.message });
  }
});

// PUT /api/todos/:id - Update a todo (e.g., mark as completed)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  if (typeof completed === 'undefined' && typeof title === 'undefined') {
    return res.status(400).json({ error: 'Either title or completed status must be provided for update.' });
  }
  
  const updateData = {};
  if (typeof title !== 'undefined') updateData.title = title;
  if (typeof completed !== 'undefined') updateData.completed = completed;


  try {
    const { data, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating todo:', error);
      throw error;
    }
    if (!data) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo', details: err.message });
  }
});

// DELETE /api/todos/:id - Delete a todo
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .select() // Returns the deleted record(s)
      .single(); // Expect a single record or null if not found

    if (error) {
      console.error('Supabase error deleting todo:', error);
      throw error;
    }
    
    // Supabase delete returns the deleted item. If `data` is null and no error, it means not found.
    if (!data && !error) { // Check if data is null and no error occurred
        return res.status(404).json({ error: 'Todo not found or already deleted' });
    }

    res.status(200).json({ message: 'Todo deleted successfully', deletedTodo: data });
  } catch (err) {
    // Handle cases where the item might not exist, which Supabase might not treat as a top-level error
    if (err.message.includes("JSON object requested, multiple (or no) rows returned")) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(500).json({ error: 'Failed to delete todo', details: err.message });
  }
});

// POST /api/summarize - Summarize pending todos and send to Slack
router.post('/summarize', async (req, res) => {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!slackWebhookUrl) {
    return res.status(500).json({ error: 'Slack Webhook URL not configured on server.' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API Key not configured on server.' });
  }

  try {
    // 1. Fetch pending todos from Supabase
    const { data: pendingTodos, error: fetchError } = await supabase
      .from('todos')
      .select('title')
      .eq('completed', false)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Supabase error fetching pending todos:', fetchError);
      throw fetchError;
    }

    if (!pendingTodos || pendingTodos.length === 0) {
      const noPendingMessage = 'No pending todos to summarize.';
      // Optionally send this to Slack too
      await axios.post(slackWebhookUrl, { text: `Todo Summary:\n${noPendingMessage}` });
      return res.json({ message: noPendingMessage, summary: noPendingMessage, slackSent: true });
    }

    const todosText = pendingTodos.map(todo => `- ${todo.title}`).join('\n');

    // 2. Generate summary using Gemini API
    const summary = await generateSummaryWithGemini(todosText);

    // 3. Post summary to Slack
    const slackMessage = {
      text: `📝 *Todo Summary Assistant* 📝\n\nHere's a summary of your pending tasks:\n\n${summary}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📝 Todo Summary Assistant",
            emoji: true
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Here's a summary of your pending tasks:*"
          }
        },
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: summary
          }
        },
        {
            type: "context",
            elements: [
                {
                    type: "mrkdwn",
                    text: `Summary generated at: ${new Date().toLocaleString()}`
                }
            ]
        }
      ]
    };

    await axios.post(slackWebhookUrl, slackMessage);

    res.json({ message: 'Summary generated and sent to Slack successfully!', summary, slackSent: true });

  } catch (err) {
    console.error('Error in /summarize endpoint:', err);
    res.status(500).json({ 
        error: 'Failed to generate summary or send to Slack.', 
        details: err.message,
        slackSent: false // Indicate Slack sending might have failed
    });
  }
});

export default router;
