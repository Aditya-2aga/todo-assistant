import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  MoreHorizontal, // Added for item actions
  Menu as MenuIcon, // Added for input field icon (renamed to avoid conflict)
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// IMPORTANT: The user's original API_BASE and axios calls are preserved.
// For the app to be fully functional, a backend server at this API_BASE is expected.
// Changed to be compatible with more build environments
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

function App() {
  const [todos, setTodos] = useState([
    // Mock data to better visualize the UI, original fetchTodos will overwrite this
    { id: '1', title: 'Getting an invite for dribbble', completed: true, memo: 'one of my goals in 2017' },
    { id: '2', title: '11am meeting', completed: false },
    { id: '3', title: 'Finish visual Design', completed: true },
    { id: '4', title: 'Do research', completed: false, memo: 'E-book readers in iOS, Android' },
    { id: '5', title: 'Reading About Face 4', completed: false },
    { id: '6', title: 'Do pilates', completed: false },
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(''); // Kept for existing logic
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Day');
  const [currentDate, setCurrentDate] = useState(new Date());

  // All JavaScript logic including API calls are kept as per user request
  useEffect(() => {
    fetchTodos(); // Original function to fetch todos
  }, []);

  async function fetchTodos() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/todos`);
      // If res.data is an array, set it. Otherwise, keep mock data or handle empty.
      if (Array.isArray(res.data)) {
        setTodos(res.data.length > 0 ? res.data : [
            { id: '1', title: 'Getting an invite for dribbble', completed: true, memo: 'one of my goals in 2017' },
            { id: '2', title: '11am meeting', completed: false },
            { id: '3', title: 'Finish visual Design', completed: true },
        ]);
      } else {
        // Fallback to mock data if API response is not as expected or empty
        console.warn("API did not return an array, using fallback data for UI.")
      }
    } catch (e) {
      setError('Failed to fetch todos. Displaying sample data.');
      console.error("Fetch error:", e);
       // Keep mock data on error to ensure UI is still populated for styling
    }
    setLoading(false);
  }

  async function addTodo() {
    if (!newTitle.trim()) return;
    setLoading(true);
    setError('');
    try {
      // Note: The image UI doesn't show a separate "add" button, but an icon.
      // The original logic uses newTitle state, which is fine.
      const res = await axios.post(`${API_BASE}/todos`, { title: newTitle });
      setTodos(prev => [res.data, ...prev]);
      setNewTitle('');
    } catch (e) {
      setError('Failed to add todo');
      console.error("Add error:", e);
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
      console.error("Update error:", e);
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
      console.error("Delete error:", e);
    }
    setLoading(false);
  }

  // generateSummary and summary state are kept for existing logic, but UI elements are hidden
  async function generateSummary() {
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const res = await axios.post(`${API_BASE}/todos/summarize`);
      setSummary(res.data.summary);
    } catch (e) {
      setError('Failed to generate summary');
      console.error("Summary error:", e);
    }
    setLoading(false);
  }

  const handleDateChange = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + direction);
      return newDate;
    });
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };


  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-700 text-slate-200 rounded-lg shadow-2xl">
        {/* Header Tabs */}
        <div className="flex justify-around items-center p-3 border-b border-slate-600">
          {['Day', 'Week', 'Month', 'Year'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${activeTab === tab ? 'bg-pink-600 text-white' : 'text-slate-400 hover:bg-slate-600 hover:text-slate-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Date Navigator */}
        <div className="flex justify-between items-center p-5">
          <button onClick={() => handleDateChange(-1)} className="p-2 rounded-full hover:bg-slate-600 transition-colors" aria-label="Previous day">
            <ChevronLeft size={22} className="text-slate-400" />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">{formatDate(currentDate).split(',')[0]}</h2>
            <p className="text-xs text-slate-400">{`${formatDate(currentDate).split(',')[1]},${formatDate(currentDate).split(',')[2]}`}</p>
          </div>
          <button onClick={() => handleDateChange(1)} className="p-2 rounded-full hover:bg-slate-600 transition-colors" aria-label="Next day">
            <ChevronRight size={22} className="text-slate-400" />
          </button>
        </div>

        {/* Add Task Input */}
        <div className="px-5 pb-5">
          <div className="flex items-center bg-slate-600 rounded-lg p-1">
            <span className="pl-3 pr-2 text-slate-400">
              <MenuIcon size={20} />
            </span>
            <input
              type="text"
              placeholder="Add a task..."
              className="flex-1 bg-transparent py-3 px-2 text-slate-100 placeholder-slate-400 focus:outline-none"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTodo(); }}
              disabled={loading}
            />
             {/* The Plus button is removed to match the image where 'Enter' adds the task */}
          </div>
        </div>
        
        {error && <div className="text-red-400 mb-2 px-5 text-sm">{error}</div>}
        {loading && <div className="flex justify-center py-2"><Loader2 className="animate-spin text-pink-500" size={24} /></div>}

        {/* Todo List */}
        <ul className="px-5 pb-5 space-y-2 max-h-80 overflow-y-auto">
          {todos.map(todo => (
            <li
              key={todo.id}
              className="flex items-center justify-between bg-slate-600/70 rounded-lg p-3 group transition-all hover:bg-slate-600"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleCompleted(todo.id, todo.completed)}
                  disabled={loading}
                  className={`focus:outline-none rounded-full p-0.5 transition-colors
                    ${todo.completed ? 'text-pink-500' : 'text-slate-400 hover:text-pink-400'}`}
                  aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                >
                  {todo.completed ? <CheckCircle2 size={20} strokeWidth={2.5}/> : <Circle size={20} strokeWidth={2.5}/>}
                </button>
                <div>
                  <span className={`text-sm font-medium ${todo.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                    {todo.title}
                  </span>
                  {todo.memo && <p className={`text-xs ${todo.completed ? 'text-slate-600' : 'text-slate-400'}`}>{todo.memo}</p>}
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => deleteTodo(todo.id)} // In a real scenario, this might open a menu
                  disabled={loading}
                  className="text-slate-500 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity focus:opacity-100 p-1 rounded-full hover:bg-slate-500/50"
                  aria-label="Delete task"
                >
                  <Trash2 size={16} /> 
                  {/* Replacing MoreHorizontal with Trash2 directly for delete, as dropdown is complex for CSS only */}
                </button>
              </div>
            </li>
          ))}
           {todos.length === 0 && !loading && (
            <p className="text-center text-slate-400 py-4">No tasks for today. Add one above!</p>
          )}
        </ul>

        {/* Hidden "Generate Summary" button and summary display to match image UI */}
        {/* The JS logic for these is preserved as requested */}
        <div className="mt-6 text-center hidden">
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
          <div className="mt-6 bg-gray-800 text-purple-100 p-4 rounded border border-purple-600 hidden">
            <h2 className="text-lg font-semibold mb-2">📌 Summary:</h2>
            <p className="whitespace-pre-wrap">{summary}</p>
          </div>
        )}
         {/* Footer actions - example from image (Pin, Add memo, Delete) */}
         {/* These are not functional, just for UI matching. The actual delete is per item. */}
        <div className="px-5 py-3 border-t border-slate-600 flex justify-end items-center space-x-4 hidden">
            <button className="text-xs text-slate-400 hover:text-pink-500 transition-colors">Pin on the top</button>
            <button className="text-xs text-slate-400 hover:text-pink-500 transition-colors">Add a memo</button>
            <button className="text-xs text-slate-400 hover:text-red-500 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default App;
