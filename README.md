# Innovative AI - Full Stack Development Platform

A comprehensive full-stack development platform with AI-powered assistance, real-time collaboration, and integrated development tools.

## 🚀 Features

### Core Modules
- **User Authentication** - Secure login/register with JWT tokens
- **Project Management** - Create and manage development projects
- **Real-time Chat** - Team collaboration with instant messaging
- **AI Assistant** - Intelligent code generation and project analysis
- **File Manager** - Organize and manage project files
- **Code Editor** - Built-in code editor with syntax highlighting
- **Terminal** - Integrated terminal for command execution
- **Dashboard** - Project overview and statistics
- **Settings** - User preferences and configuration

### AI Capabilities
- Code generation from natural language
- Project analysis and suggestions
- Intelligent chat responses
- Code optimization recommendations

### Development Tools
- File creation and management
- Code editing with multiple language support
- Terminal commands (npm, git, etc.)
- Real-time collaboration
- Project statistics and insights

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin requests

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation
- **RemixIcon** - Icons

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Innovative_AI
   ```

2. **Install Backend dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend dependencies**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **🔒 Set up environment variables (CRITICAL)**
   
   **⚠️ SECURITY WARNING: Never commit .env files to Git!**
   
   **Backend Setup:**
   ```bash
   cd Backend
   cp .env.example .env
   # Edit .env with your actual API keys and secrets
   ```
   
   **Frontend Setup:**
   ```bash
   cd Frontend
   cp .env.example .env
   # Edit .env with your API URL
   ```
   
   **📋 Required API Keys:**
   - Google OAuth credentials (Google Cloud Console)
   - GitHub OAuth credentials (GitHub Developer Settings)
   - Gemini API key (Google AI Studio)
   - Strong JWT secret key
   
   **📖 See [SECURITY.md](SECURITY.md) for detailed setup instructions**

5. **Start the application**
   
   **Option 1: Use the batch script (Windows)**
   ```bash
   run-project.bat
   ```
   
   **Option 2: Manual start**
   ```bash
   # Terminal 1 - Backend
   cd Backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd Frontend
   npm run dev
   ```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **MongoDB**: mongodb://localhost:27017

## 📱 Usage

### Getting Started
1. Register a new account or login
2. Create your first project
3. Start coding with the integrated editor
4. Use AI assistant for help and suggestions
5. Collaborate with team members via chat

### AI Assistant Commands
- Ask questions about your code
- Request code generation
- Get project analysis
- Receive optimization suggestions

### Terminal Commands
- `help` - Show available commands
- `ls` - List files
- `npm install` - Install packages
- `git status` - Check git status
- `clear` - Clear terminal

## 🔧 API Endpoints

### Authentication
- `POST /users/register` - User registration
- `POST /users/login` - User login
- `GET /users/profile` - Get user profile
- `GET /users/logout` - User logout

### Projects
- `POST /projects/create` - Create project
- `GET /projects/all` - Get user projects
- `PUT /projects/add-user` - Add collaborator
- `GET /projects/get-project/:id` - Get project details

### AI Services
- `POST /ai/generate-response` - Generate AI response
- `POST /ai/generate-code` - Generate code
- `POST /ai/analyze-project/:id` - Analyze project

### Chat
- `POST /chat/send` - Send message
- `GET /chat/messages/:roomId` - Get messages
- `GET /chat/online-users` - Get online users

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Token blacklisting for logout
- CORS protection
- Input validation
- Secure environment variables

## 🎨 UI Components

- **Dashboard** - Project overview
- **File Manager** - File organization
- **Code Editor** - Code editing
- **AI Chat** - AI assistance
- **Terminal** - Command execution
- **Settings** - User preferences

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Configure MongoDB connection
3. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔄 Updates

The project is actively maintained with regular updates for:
- New AI features
- Security improvements
- Performance optimizations
- Bug fixes
- UI enhancements

---

**Built with ❤️ for developers by developers**