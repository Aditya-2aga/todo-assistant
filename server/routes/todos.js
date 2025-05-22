import express from 'express';
import { supabase } from '../db.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

async function generateSummaryWithGemini(todosText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set.');
    throw new Error('Gemini API key not configured.');
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const prompt = `You are a smart personal assistant summarizing pending to-do tasks for a user.

Here is a list of pending to-do items:
\n\n${todosText}

Please analyze the tasks and provide a concise, structured summary that includes the following:

1. **Overall Summary**: A brief overview of how many tasks are pending and the general workload.
2. **High-Priority Tasks**: Identify tasks that seem urgent, important, or time-sensitive. Mention any that have explicit or implied deadlines.
3. **Related or Grouped Tasks**: Group tasks that are logically related or dependent on each other.
4. **Deadline Awareness**: Highlight any tasks that mention dates, times, or deadlines.
5. **Recommendations**: Suggest what the user should consider doing next (e.g., tasks to tackle first, group similar tasks, delegate, etc.).

Only include incomplete tasks. Ignore any completed items. Use clear, concise language suitable for posting in a Slack message.`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.5,
      topK: 1,
      topP: 1,
      maxOutputTokens: 250,
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
    throw error;
  }
}

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

router.post('/', async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const { data, error } = await supabase
      .from('todos')
      .insert([{ title, completed: false }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error adding todo:', error);
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add todo', details: err.message });
  }
});

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

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error deleting todo:', error);
      throw error;
    }
    
    if (!data && !error) {
        return res.status(404).json({ error: 'Todo not found or already deleted' });
    }

    res.status(200).json({ message: 'Todo deleted successfully', deletedTodo: data });
  } catch (err) {
    if (err.message.includes("JSON object requested, multiple (or no) rows returned")) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(500).json({ error: 'Failed to delete todo', details: err.message });
  }
});

router.post('/summarize', async (req, res) => {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!slackWebhookUrl) {
    return res.status(500).json({ error: 'Slack Webhook URL not configured on server.' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API Key not configured on server.' });
  }

  try {
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
      await axios.post(slackWebhookUrl, { text: `Todo Summary:\n${noPendingMessage}` });
      return res.json({ message: noPendingMessage, summary: noPendingMessage, slackSent: true });
    }

    const todosText = pendingTodos.map(todo => `- ${todo.title}`).join('\n');

    const summary = await generateSummaryWithGemini(todosText);

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
        slackSent: false
    });
  }
});

export default router;
