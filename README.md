# Todo Summary Assistant

The Todo Summary Assistant is a comprehensive full-stack web application designed to help users efficiently manage their daily tasks while leveraging artificial intelligence to provide intelligent summaries. The application combines modern web technologies with AI integration to create a seamless task management experience that can automatically communicate with team collaboration tools.

## **Application Overview**

This application provides users with a complete task management solution that goes beyond simple todo tracking. Users can create, manage, and organize their tasks through an intuitive web interface, while the system intelligently processes pending tasks to generate meaningful summaries using advanced language models. These summaries can be automatically shared with team members through Slack integration, making it an ideal solution for both personal productivity and team coordination.

## **Core Features**

The frontend interface, built with React and styled using Tailwind CSS, provides users with comprehensive task management capabilities. Users can easily add new todo items, view their complete task list, and delete items that are no longer needed. The application also allows users to mark tasks as complete or incomplete with simple click interactions. A dedicated button triggers the AI summary generation process and automatically sends the results to the configured Slack channel. The interface provides clear feedback through success and failure notifications, ensuring users always know the status of their Slack communications.

The backend infrastructure, developed using Node.js and Express, provides robust RESTful API endpoints for all task management operations. The system includes a specialized endpoint that retrieves pending tasks, processes them through an AI language model to generate intelligent summaries, and automatically posts these summaries to designated Slack channels.

Data persistence is handled through Supabase, which provides a PostgreSQL database solution. The database stores all todo items with comprehensive metadata including unique identifiers, task titles, completion status, and creation timestamps.

The AI integration utilizes the Google Gemini API to analyze and summarize pending tasks, providing users with intelligent insights into their workload and priorities.

Slack integration is implemented through Incoming Webhooks, allowing the application to seamlessly post generated summaries directly to configured Slack channels, facilitating team communication and task visibility.

## **Technical Architecture**

The application follows a clean separation of concerns with the frontend and backend maintained in distinct client and server directories. This monorepo-like structure ensures clear organization while maintaining the ability to deploy components independently.

React was selected for the frontend development due to its component-based architecture and extensive ecosystem, which enables efficient UI development and maintenance. The framework provides excellent state management capabilities and seamless integration with modern development tools.

Tailwind CSS serves as the styling framework, offering a utility-first approach that accelerates UI development while maintaining design consistency and customization flexibility. This choice allows for rapid prototyping and easy maintenance of the user interface.

The backend utilizes Node.js with Express framework, a proven combination for building scalable RESTful APIs. This technology stack was chosen for its performance characteristics, development speed, and extensive JavaScript ecosystem integration.

Supabase provides the database infrastructure with PostgreSQL as the underlying database engine. This choice offers enterprise-grade reliability and scalability while providing a generous free tier for development and testing. Supabase also includes auto-generated APIs, though the application primarily uses the Node.js client library for custom backend logic implementation.

Google Gemini API handles the AI language processing requirements, offering sophisticated language understanding and generation capabilities. The service provides a suitable free tier for development and testing purposes while delivering high-quality text summarization results.

Slack integration is implemented through Incoming Webhooks, providing a straightforward method for posting messages from external applications into Slack channels without complex authentication workflows.

All sensitive configuration data, including API keys, database connection strings, and webhook URLs, is managed through environment variables, ensuring security best practices and deployment flexibility.

## **System Requirements**

Before setting up the application, ensure your development environment includes Node.js version 18 or later. You can use either npm or yarn as your package manager based on your preference.

You will need a Supabase account to access the PostgreSQL database services. Create an account at the Supabase website and set up a new project for this application.

For AI functionality, you need access to Google Gemini API through a Google Cloud Project with the Gemini API enabled. Alternatively, you can obtain an API key through Google AI Studio.

Slack integration requires access to a Slack workspace where you have permission to add Incoming Webhooks. You will need administrative or appropriate permissions to configure webhook integrations.

## **Installation and Setup Process**

Begin by cloning the repository to your local development environment using your preferred Git client. Navigate to the project directory after cloning is complete.

**Backend Configuration**

Navigate to the server directory within the project structure. Install all required dependencies using npm install or yarn install based on your package manager preference.

Create your environment configuration by copying the provided env.example file to create a new env file. This file will contain all your sensitive configuration data.

Configure your Supabase connection by accessing your Supabase project dashboard. Navigate to Project Settings and then to the Database section. Locate the connection string URI which follows the format postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres. Also access the API settings to obtain your Project API key and Project URL.

Update your server env file with the Supabase credentials including the project URL and anon key. Add your Gemini API key obtained from Google AI Studio. Include your Slack webhook URL which you will configure separately. Set your preferred port number for the backend server, typically 3001.

Database setup requires creating the todos table in your Supabase project. Access the SQL Editor in your Supabase dashboard and create a new query. Execute the following SQL commands to establish the proper table structure and security policies:

```sql
CREATE TABLE todos (
id BIGSERIAL PRIMARY KEY,
title TEXT NOT NULL,
completed BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable public read access" ON todos FOR SELECT USING (true);
CREATE POLICY "Enable public insert access" ON todos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable public update access" ON todos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable public delete access" ON todos FOR DELETE USING (true);
```

For Google Gemini API configuration, visit Google AI Studio to create your API key. Ensure the Gemini API is enabled for your Google Cloud Project. Add this key to your server env file.

Configure Slack integration by visiting the Slack API website and creating a new app. Choose the "From scratch" option and provide a name such as "Todo Summarizer" while selecting your target workspace. Navigate to Incoming Webhooks under Features and activate this functionality. Add a new webhook to your workspace, select the target channel for messages, and copy the provided webhook URL to your server env file.

Start your backend server using npm start or yarn start. The server will run on localhost port 3001 or your configured port.

**Frontend Configuration**

Open a new terminal session and navigate to the client directory. Install all frontend dependencies using npm install or yarn install.

Create your frontend environment configuration by copying the provided env.example file. Update the client env file with your API base URL, typically http://localhost:3001/api, ensuring the port matches your backend configuration.

Start the frontend development server using npm run dev or yarn dev. The application will be accessible at localhost port 5173 or another available port.

## **Application Usage**

Access the application through your web browser at the frontend URL. The interface allows you to add new todo items through the input field and add button. You can mark items as complete or incomplete by clicking on them. Remove unwanted items using the delete functionality.

The Generate Summary and Send to Slack button triggers the AI processing workflow. This feature retrieves all pending tasks, generates an intelligent summary using the Gemini API, and automatically posts the results to your configured Slack channel.

## **API Documentation**

The backend provides RESTful endpoints with the /api prefix for all operations.

GET /todos retrieves all stored todo items from the database.

POST /todos creates a new todo item. Send a JSON request body containing the title field with your task description.

PUT /todos/:id updates an existing todo item identified by its ID. The request body should include the completed field with a boolean value.

DELETE /todos/:id removes a todo item identified by its ID from the database.

POST /summarize triggers the AI summary generation process. This endpoint retrieves pending todos, generates a summary using Gemini, and posts the result to your configured Slack channel.

## **Deployment Options**

**Frontend Deployment**

Push your complete repository to a Git hosting service such as GitHub, GitLab, or Bitbucket.

For Vercel deployment, sign in to your Vercel account and import your Git repository. Configure the project with Vite as the framework preset, npm run build as the build command, client/dist as the output directory, and client as the root directory. Add the VITE_API_BASE_URL environment variable pointing to your deployed backend URL.

For Netlify deployment, sign in to your Netlify account and import your repository. Set npm run build as the build command, client/dist as the publish directory, and client as the base directory. Configure the VITE_API_BASE_URL environment variable with your backend URL.

**Backend Deployment**

Several platforms support Node.js backend deployment including Render with its generous free tier, Fly.io for containerized applications, and Vercel for serverless functions.

For Render deployment, ensure your server package.json includes a proper start script and that your server uses process.env.PORT for the listening port. Create a new Web Service on Render, connect your Git repository, set server as the root directory, configure npm install as the build command, and npm start as the start command. Add all required environment variables including SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY, and SLACK_WEBHOOK_URL.

After backend deployment, update the VITE_API_BASE_URL in your frontend deployment to reference the new backend URL.

## **Development Guidelines**

This project welcomes contributions through pull requests. For significant changes, please open an issue first to discuss proposed modifications. Ensure any changes include appropriate tests and documentation updates.

The codebase follows standard JavaScript and React conventions. Maintain the existing code structure and naming patterns when contributing. All environment variables should remain configurable and never be hardcoded into the application.

When adding new features, consider the impact on both frontend and backend components. Ensure API changes are properly documented and that the frontend interface adapts appropriately to new functionality.

The application prioritizes user experience and reliability. Any modifications should maintain or improve the current level of functionality while ensuring robust error handling and user feedback mechanisms.