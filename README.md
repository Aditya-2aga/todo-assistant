Todo Summary Assistant
The "Todo Summary Assistant" is a full-stack application that allows users to manage their to-do items, generate a summary of pending tasks using an AI Language Model, and send this summary to a designated Slack channel.


**Features**
Frontend (React & Tailwind CSS):
Add, view, and delete to-do items.
Mark to-do items as complete or incomplete.
Button to trigger summary generation and send to Slack.
Display success/failure notifications for Slack messages.
Backend (Node.js & Express):
RESTful APIs for managing to-do items.
Endpoint to fetch pending todos, generate a summary using an LLM, and post it to Slack.
Database (Supabase - PostgreSQL):
Stores to-do items with id, title, completed status, and createdAt timestamp.
LLM Integration (Google Gemini API):
Summarizes pending to-do items.
Slack Integration:
Posts the generated summary to a configured Slack channel via Incoming Webhooks.


**Project Structure**
todo-summary-assistant/
├── client/                  # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── AddTodoForm.jsx
│   │   │   ├── TodoItem.jsx
│   │   │   └── TodoList.jsx
│   │   ├── App.jsx          # Main application component
│   │   ├── index.css        # Tailwind CSS and global styles
│   │   └── main.jsx         # Entry point for React app
│   ├── .env.example         # Example environment variables for frontend
│   ├── package.json
│   └── tailwind.config.js
│   └── postcss.config.js
├── server/                  # Node.js/Express Backend
│   ├── routes/              # API routes
│   │   └── todos.js
│   ├── .env.example         # Example environment variables for backend
│   ├── db.js                # Supabase client configuration
│   └── server.js            # Express application
├── .gitignore
└── README.md


**Architecture and Design Choices**
Monorepo-like Structure: The frontend and backend are in separate client and server directories for clear separation of concerns.
React for Frontend: Chosen for its component-based architecture and rich ecosystem, making UI development efficient.
Tailwind CSS: A utility-first CSS framework for rapid UI development and easy customization.
Node.js & Express for Backend: A popular choice for building RESTful APIs due to its speed, simplicity, and JavaScript ecosystem.
Supabase (PostgreSQL): Provides a robust, scalable, and easy-to-use PostgreSQL database with a generous free tier, along with auto-generated APIs (though we'll primarily use its Node.js client library for custom backend logic).
Google Gemini API: Used for its powerful language understanding and generation capabilities to summarize todos. It offers a free tier suitable for development.
Slack Incoming Webhooks: A simple way to post messages from external sources into Slack.
Environment Variables: All sensitive information (API keys, database URLs, Slack webhook URLs) is managed through environment variables for security and configurability.


**Prerequisites**
Node.js (v18 or later recommended)
npm or yarn
A Supabase account (for PostgreSQL database)
A Google Cloud Project with the Gemini API enabled (or an API key for another LLM provider)
A Slack workspace and permission to add Incoming Webhooks
Setup Instructions
**Clone the Repository**
git clone <repository-url>
cd todo-summary-assistant


**Setup Backend (server/)**
Navigate to the server directory:
cd server


Install dependencies:
npm install
# or
yarn install


Create a .env file by copying .env.example:
cp .env.example .env


Configure Supabase:
a. Go to Supabase and create a new project.
b. In your Supabase project, go to "Project Settings" > "Database".
c. Under "Connection string" > "URI", copy the URI. It will look like: postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres.
d. In your Supabase project, go to "Project Settings" > "API".
e. Copy the Project API key (this is the anon key, which is public).
f. Copy the Project URL.
Update your server/.env file with your Supabase credentials:
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
# For direct DB connection if needed (though Supabase client library is preferred for app logic)
# DATABASE_URL=your_supabase_connection_string_uri

# Gemini API Key (or your chosen LLM provider's API key)
GEMINI_API_KEY=your_google_ai_studio_api_key

# Slack Incoming Webhook URL
SLACK_WEBHOOK_URL=your_slack_incoming_webhook_url

PORT=3001 # Or any port you prefer for the backend


Set up the todos table in Supabase:
a. In your Supabase project dashboard, go to the "SQL Editor".
b. Click "New query" and run the following SQL to create the todos table:
```sql
CREATE TABLE todos (
id BIGSERIAL PRIMARY KEY,
title TEXT NOT NULL,
completed BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable Row Level Security (RLS) - Recommended for Supabase
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policies for allowing access (adjust as needed for your auth setup)
-- This policy allows all authenticated users to perform all operations.
-- For a production app, you'd likely have more granular policies.

CREATE POLICY "Enable all access for authenticated users"
ON todos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- If you want to allow anonymous access (e.g., for testing without user login):
-- CREATE POLICY "Enable public access"
-- ON todos
-- FOR ALL
-- TO public  -- or anon
-- USING (true)
-- WITH CHECK (true);
-- Be cautious with public write access.

-- Note: The Supabase client library uses the user's JWT to interact with the database,
-- so RLS policies based on `auth.uid()` are common. For this example, if you
-- don't implement user authentication in the app itself, you might rely on the
-- anon key's permissions or simpler policies. The provided policies are a starting point.
-- For this project, we are not implementing user authentication in the client/server,
-- so the `SUPABASE_ANON_KEY` will be used, which typically has `anon` role.
-- You might need to adjust policies if `anon` role doesn't have insert/select/update/delete by default.
-- A simpler policy for anon access if not using user auth:

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON todos;
CREATE POLICY "Enable public read access" ON todos FOR SELECT USING (true);
CREATE POLICY "Enable public insert access" ON todos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable public update access" ON todos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable public delete access" ON todos FOR DELETE USING (true);

```


Configure Google Gemini API Key:
a. Go to Google AI Studio.
b. Create an API key.
c. Ensure the Gemini API (or Generative Language API) is enabled for your Google Cloud Project associated with the API key.
d. Add this key to your server/.env file as GEMINI_API_KEY.

Configure Slack Incoming Webhook:
a. Go to Slack API.
b. Click "Create New App", choose "From scratch".
c. Name your app (e.g., "Todo Summarizer") and select your workspace.
d. In the app settings, go to "Incoming Webhooks" under "Features".
e. Activate Incoming Webhooks.
f. Click "Add New Webhook to Workspace".
g. Choose a channel where messages will be posted and click "Allow".
h. Copy the Webhook URL provided.
i. Add this URL to your server/.env file as SLACK_WEBHOOK_URL.



**Start the backend server:**
npm start
# or
yarn start


The backend will run on http://localhost:3001 (or the port you configured).
**Setup Frontend (client/)**
Open a new terminal and navigate to the client directory:
cd client


Install dependencies:
npm install
# or
yarn install


Create a .env file by copying .env.example:
cp .env.example .env


Update your client/.env file:
VITE_API_BASE_URL=http://localhost:3001/api


(Ensure the port matches your backend server's port if you changed it.)
Start the frontend development server:
npm run dev
# or
yarn dev


The frontend will run on http://localhost:5173 (or another port if 5173 is busy).


**Using the Application**
Open your browser and go to the frontend URL (e.g., http://localhost:5173).
Add new to-do items.
Mark items as complete/incomplete.
Delete items.
Click the "Generate Summary & Send to Slack" button to get an AI-generated summary of pending todos posted to your configured Slack channel.

API Endpoints (Backend)
All endpoints are prefixed with /api.
GET /todos: Fetch all to-do items.
POST /todos: Add a new to-do item.
Request body: { "title": "Your todo title" }
PUT /todos/:id: Update a to-do item (primarily for marking as complete/incomplete).
Request body: { "completed": true/false }
DELETE /todos/:id: Delete a to-do item.
POST /summarize: Fetches pending todos, generates a summary using Gemini, and posts it to Slack.

**Deployment (Optional)**
Frontend (React) on Vercel/Netlify
Push your todo-summary-assistant repository to GitHub/GitLab/Bitbucket.

Vercel:
Sign up or log in to Vercel.
Import your Git repository.
Configure the project:
Framework Preset: Vite (or Create React App if you used that).
Build Command: npm run build (or yarn build).
Output Directory: client/dist.
Root Directory: client.
Environment Variables: Add VITE_API_BASE_URL and set it to your deployed backend URL.
Deploy.

Netlify:
Sign up or log in to Netlify.
Import your Git repository.
Configure the project:
Build Command: npm run build (or yarn build).
Publish directory: client/dist.
Base directory: client (set this in Build settings > "Base directory").
Environment Variables: Add VITE_API_BASE_URL and set it to your deployed backend URL.
Deploy.

Backend (Node.js/Express)
You can deploy the Node.js backend to services like:
Render: Good free tier for Node.js apps.
Fly.io: Offers a free tier, good for containerized applications.
Heroku (Paid): Classic PaaS, now mostly paid.
Vercel (Serverless Functions): You can refactor your Express app into Vercel Serverless Functions. This requires a different setup where each route might become a separate function, or you use Express within a single serverless function handler. The server directory would be placed in an api folder at the root of your project for Vercel to pick it up automatically.

**General Steps for Deploying Backend (e.g., on Render):**
Ensure your server/package.json has a start script like "start": "node server.js".
Ensure your server.js uses process.env.PORT for the listening port.
Push your code to your Git provider.
On Render (or similar):
Create a new "Web Service".
Connect your Git repository.
Set the Root Directory to server.
Set the Build Command (e.g., npm install or yarn install).
Set the Start Command (e.g., npm start or yarn start).
Add environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY, SLACK_WEBHOOK_URL.
Deploy.
Once deployed, update VITE_API_BASE_URL in your frontend deployment to point to this new backend URL.


**Contributing**
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
Please make sure to update tests as appropriate.
