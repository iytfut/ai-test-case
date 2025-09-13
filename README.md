# 🤖 AI-Powered Test Case Generator

A comprehensive web application that automatically generates test cases for your GitHub repositories using AI. Built with React, Node.js, and multiple AI providers.

## ✨ Features

### 🔐 GitHub Integration

- **OAuth Authentication**: Secure login with GitHub
- **Repository Listing**: Browse all your GitHub repositories
- **File Selection**: Choose specific source code files for testing
- **Pull Request Creation**: Automatically create PRs with generated tests

### 🤖 AI-Powered Test Generation

- **Multiple AI Providers**: Support for OpenAI, Gemini, and Ollama
- **Smart Analysis**: AI analyzes your code and suggests test scenarios
- **Framework Detection**: Automatically recommends appropriate testing frameworks
- **Comprehensive Coverage**: Generates unit tests, integration tests, and edge cases

### 📁 Supported Languages & Frameworks

- **JavaScript/TypeScript**: Jest, Mocha, Vitest
- **Python**: Pytest, Unittest, Nose
- **Java**: JUnit, TestNG
- **C++**: Google Test, Catch2
- **C#**: NUnit, xUnit, MSTest
- **PHP**: PHPUnit, Codeception
- **Ruby**: RSpec, Minitest
- **Go**: Testing, Testify
- **Rust**: Cargo Test
- **And more...**

### 🎨 Modern UI/UX

- **Responsive Design**: Works on desktop and mobile
- **Real-time Feedback**: Loading states and progress indicators
- **Code Highlighting**: Syntax-highlighted test code display
- **Copy/Download**: Easy export of generated tests

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub account
- AI API key (OpenAI, Gemini, or Ollama)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd test-case-generator
```

### 2. Backend Setup

```bash
cd backend
npm install
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# GitHub OAuth (Required)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback

# Session Configuration
SESSION_SECRET=your_session_secret_key_here

# AI API Configuration (Choose one)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo

# OR Gemini
GEMINI_API_KEY=your_gemini_api_key

# OR Ollama (for local AI)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=codellama

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp env.example .env
```

Edit frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` to use the application!

## 🔧 GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Test Case Generator
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5000/auth/github/callback`
4. Copy the Client ID and Client Secret to your `.env` file

## 🤖 AI Provider Setup

### Option 1: OpenAI (Recommended)

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `.env`: `OPENAI_API_KEY=your_key_here`

### Option 2: Google Gemini

1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`: `GEMINI_API_KEY=your_key_here`

### Option 3: Ollama (Local)

1. Install [Ollama](https://ollama.ai/)
2. Run: `ollama pull codellama`
3. Add to `.env`: `OLLAMA_BASE_URL=http://localhost:11434`

## 📖 Usage Guide

### 1. Authentication

- Click "Login with GitHub" on the homepage
- Authorize the application to access your repositories

### 2. Repository Selection

- Browse your GitHub repositories
- Click on a repository to view its source files

### 3. File Selection

- Select one or more source code files
- Click "Generate Tests" to proceed

### 4. Test Generation

- Review AI-generated test summaries
- Click "Generate Test Code" for any summary
- Copy, download, or create a pull request with the tests

### 5. Pull Request Creation (Optional)

- Click "Create PR" on generated test code
- Customize PR title, description, and branch name
- Submit to create a pull request in your repository

## 🏗️ Architecture

```
test-case-generator/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── App.jsx         # Main app component
│   └── package.json
├── backend/                  # Node.js/Express server
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration
│   │   └── server.js       # Main server file
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `GET /api/auth/login` - GitHub OAuth login
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/logout` - Logout
- `GET /api/auth/status` - Check auth status

### GitHub Integration

- `GET /api/github/repositories` - List user repositories
- `GET /api/github/repositories/:owner/:repo/files` - List source files
- `POST /api/github/repositories/:owner/:repo/files/batch` - Get file contents
- `POST /api/github/repositories/:owner/:repo/pull-request` - Create PR

### AI Services

- `POST /api/ai/generate-summaries` - Generate test summaries
- `POST /api/ai/generate-code` - Generate test code
- `GET /api/ai/frameworks/:fileExtension` - Get supported frameworks

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev  # Start with nodemon
npm start    # Start production server
```

### Frontend Development

```bash
cd frontend
npm run dev  # Start Vite dev server
npm run build  # Build for production
npm run preview  # Preview production build
```

### Environment Variables

- Copy `env.example` to `.env` in both frontend and backend
- Configure GitHub OAuth and AI API keys
- Set appropriate CORS origins for your deployment

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Backend (Render/Fly.io)

1. Set environment variables
2. Deploy using the provided Dockerfile or build scripts
3. Update CORS origins for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit: `git commit -m 'Add feature'`
6. Push: `git push origin feature-name`
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Express](https://expressjs.com/) - Backend framework
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Lucide React](https://lucide.dev/) - Icons
- [React Hot Toast](https://react-hot-toast.com/) - Notifications

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages

---

**Happy Testing! 🧪✨**
