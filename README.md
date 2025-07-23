# InterviewIQ Backend

🚀 **AI-Powered Interview Coach Backend API**

A comprehensive Node.js/Express backend that powers the InterviewIQ frontend with AI-driven interview coaching, CV optimization, and career insights.

## 🌟 Features

- **🎤 AI Interview Sessions** - Conduct realistic interview sessions with OpenAI
- **📄 CV Optimization** - AI-powered resume analysis and improvement suggestions
- **📊 Progress Tracking** - Monitor interview performance and improvement over time
- **🌐 Career Hub** - Get market insights and job search assistance
- **🔒 Secure & Scalable** - Built with security best practices and rate limiting

## 🛠️ Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **AI Integration**: OpenAI GPT-3.5/4
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: dotenv

## 🚀 Quick Start

### 1. Clone & Install

\`\`\`bash
git clone <your-repo-url>
cd interviewiq-backend
npm install
\`\`\`

### 2. Environment Setup

Create a `.env` file in the root directory:

\`\`\`env
# Required: OpenAI API Key
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Optional: Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
\`\`\`

### 3. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Copy and paste it into your `.env` file

### 4. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

The server will start on `http://localhost:3001`

### 5. Test the Connection

Visit `http://localhost:3001/health` - you should see:
\`\`\`json
{
  "status": "OK",
  "message": "InterviewIQ Backend is running!",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
\`\`\`

## 📡 API Endpoints

### 🎤 Interview Routes (`/api/interview`)

- `POST /start` - Start new interview session
- `POST /respond` - Send user response and get AI reply
- `POST /end` - End interview and get summary
- `GET /session/:id` - Get session details

### 📄 CV Routes (`/api/cv`)

- `POST /optimize` - Optimize CV with AI suggestions
- `POST /generate` - Generate CV from user input

### 📊 Progress Routes (`/api/progress`)

- `GET /stats` - Get user progress statistics
- `GET /history` - Get interview history
- `POST /update` - Update progress after session

### 🌐 Hub Routes (`/api/hub`)

- `GET /insights?role=<role>` - Get career insights for role
- `GET /search?q=<query>` - Search job opportunities

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key | ✅ Yes | - |
| `PORT` | Server port | ❌ No | 3001 |
| `NODE_ENV` | Environment | ❌ No | development |
| `FRONTEND_URL` | Frontend URL for CORS | ❌ No | http://localhost:3000 |

### File Upload Limits

- **Max file size**: 5MB
- **Allowed types**: PDF, DOC, DOCX, TXT
- **Storage**: Memory (configure disk storage for production)

### Rate Limiting

- **Window**: 15 minutes
- **Max requests**: 100 per IP
- **Applies to**: All routes

## 🏗️ Project Structure

\`\`\`
interviewiq-backend/
├── server.js              # Main server file
├── config/
│   └── openai.js          # OpenAI configuration
├── routes/
│   ├── interview.js       # Interview endpoints
│   ├── cv.js             # CV optimization endpoints
│   ├── progress.js       # Progress tracking endpoints
│   └── hub.js            # Career hub endpoints
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
└── README.md           # This file
\`\`\`

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize user inputs
- **File Upload Security**: Type and size restrictions
- **Environment Variables**: Secure configuration

## 🚀 Production Deployment

### 1. Environment Setup

\`\`\`env
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your-production-key
FRONTEND_URL=https://your-frontend-domain.com
\`\`\`

### 2. Process Management

Use PM2 for production:

\`\`\`bash
npm install -g pm2
pm2 start server.js --name "interviewiq-backend"
pm2 startup
pm2 save
\`\`\`

### 3. Database Integration

For production, replace in-memory storage with a database:

\`\`\`javascript
// Example: Replace Map with MongoDB/PostgreSQL
const sessions = new Map(); // Replace with DB queries
\`\`\`

### 4. File Storage

Configure persistent file storage:

\`\`\`javascript
// Example: Use AWS S3 or local disk storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
\`\`\`

## 🧪 Testing

### Manual Testing

1. **Health Check**:
   \`\`\`bash
   curl http://localhost:3001/health
   \`\`\`

2. **Start Interview**:
   \`\`\`bash
   curl -X POST http://localhost:3001/api/interview/start \
     -H "Content-Type: application/json" \
     -d '{"jobTitle":"Frontend Developer","company":"Google"}'
   \`\`\`

3. **CV Optimization**:
   \`\`\`bash
   curl -X POST http://localhost:3001/api/cv/optimize \
     -H "Content-Type: application/json" \
     -d '{"cvText":"John Doe\nSoftware Developer\n..."}'
   \`\`\`

### Integration with Frontend

Your frontend should connect automatically if running on `http://localhost:3000`. The API base URL is configured in the frontend's `lib/api.ts` file.

## 🐛 Troubleshooting

### Common Issues

1. **OpenAI API Key Error**:
   - Ensure your API key is valid and has credits
   - Check the `.env` file format
   - Restart the server after adding the key

2. **CORS Errors**:
   - Verify `FRONTEND_URL` in `.env`
   - Check if frontend is running on the correct port

3. **File Upload Issues**:
   - Check file size (max 5MB)
   - Verify file type (PDF, DOC, DOCX, TXT only)
   - Ensure proper form encoding

4. **Rate Limiting**:
   - Wait 15 minutes if you hit the limit
   - Adjust limits in `server.js` if needed

### Debug Mode

Enable detailed logging:

\`\`\`bash
DEBUG=* npm run dev
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Create a GitHub issue
- **Documentation**: Check this README
- **OpenAI Issues**: Check [OpenAI Status](https://status.openai.com/)

---

**🎯 Ready to power your InterviewIQ frontend!**

Start the backend, connect your frontend, and begin conducting AI-powered interview sessions!
