import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE;

function App() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/todos`);
      setTodos(res.data);
    } catch (e) {
      setError('Failed to fetch todos');
    }
    setLoading(false);
  }

  async function addTodo() {
    if (!newTitle.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/todos`, { title: newTitle });
      setTodos(prev => [res.data, ...prev]);
      setNewTitle('');
    } catch (e) {
      setError('Failed to add todo');
    }
    setLoading(false);
  }

  async function toggleCompleted(id, completed) {
    setLoading(true);
    setError('');
    try {
      const res = await axios.put(`${API_BASE}/todos/${id}`, { completed: !completed });
      setTodos(todos.map(todo => (todo.id === id ? res.data : todo)));
    } catch (e) {
      setError('Failed to update todo');
    }
    setLoading(false);
  }

  async function deleteTodo(id) {
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${API_BASE}/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (e) {
      setError('Failed to delete todo');
    }
    setLoading(false);
  }

  async function generateSummary() {
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const res = await axios.post(`${API_BASE}/todos/summarize`);
      setSummary(res.data.summary);
    } catch (e) {
      setError('Failed to generate summary');
    }
    setLoading(false);
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(todo => !todo.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-500 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-gray-900 text-white rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
          <h1 className="text-2xl font-bold">📅 Todo Summary</h1>
          <span className="text-sm text-gray-400">{new Date().toDateString()}</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Add a task..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addTodo(); }}
            disabled={loading}
          />
          <button
            onClick={addTodo}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-white transition disabled:opacity-50"
          >
            <Plus size={20} />
          </button>
        </div>

        {error && <div className="text-red-400 mb-2">{error}</div>}
        {loading && <Loader2 className="animate-spin text-purple-400 mx-auto mb-4" size={24} />}

        <div className="flex justify-center gap-4 mb-4">
          <button
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'} transition`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1 rounded ${filter === 'active' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'} transition`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'} transition`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        <ul className="space-y-3">
          {filteredTodos.map(todo => (
            <li
              key={todo.id}
              className="flex items-center justify-between bg-gray-800 rounded px-4 py-3 hover:bg-gray-700 transition"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleCompleted(todo.id, todo.completed)}
                  disabled={loading}
                  className="text-purple-400"
                >
                  {todo.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
                <span className={`text-md ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                  {todo.title}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                disabled={loading}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4 text-sm text-gray-400 text-center">
          {activeCount} task{activeCount !== 1 ? 's' : ''} left to complete
        </div>

        <div className="mt-6 text-center">
          <button
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-5 py-3 rounded-lg hover:scale-105 transition disabled:opacity-50"
            onClick={generateSummary}
            disabled={loading || todos.length === 0}
          >
            <Sparkles size={18} />
            Generate Summary & Send to Slack
          </button>
        </div>

        {summary && (
          <div className="mt-6 bg-gray-800 text-purple-100 p-4 rounded border border-purple-600">
            <h2 className="text-lg font-semibold mb-2">📌 Summary:</h2>
            <p className="whitespace-pre-wrap">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
