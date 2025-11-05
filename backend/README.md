# SkillConnect Backend API

A comprehensive backend API for SkillConnect - A campus peer-to-peer skill exchange platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Management**: Registration, authentication, profile management
- **Skill System**: Create, manage, and discover skills with categories
- **Smart Matching**: AI-powered skill matching algorithm
- **Session Management**: Schedule and manage learning sessions
- **Admin Panel**: User verification, skill moderation, analytics
- **Email Notifications**: Automated email notifications
- **Input Validation**: Comprehensive request validation
- **Security**: JWT authentication, password hashing, CORS

## 🛠️ Tech Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer with Gmail SMTP
- **Validation**: Express-validator
- **Security**: bcryptjs, CORS

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Gmail account for email functionality

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd SkillConnect/backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillconnect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRY=7d

# Server Configuration
PORT=5000

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Email Configuration (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=SkillConnect <noreply@skillconnect.com>
```

### 3. Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "linkedin": "https://linkedin.com/in/johndoe"
}
```

### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## 👤 User Management Endpoints

### Get User Profile
```http
GET /api/v1/user/profile
Authorization: Bearer <token>
```

### Update User Profile
```http
PUT /api/v1/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Smith",
  "linkedin": "https://linkedin.com/in/johnsmith"
}
```

### Add Skill to Offered Skills
```http
POST /api/v1/user/skills/offered
Authorization: Bearer <token>
Content-Type: application/json

{
  "skillId": "64a1b2c3d4e5f6789abcdef0"
}
```

### Add Skill to Seeking Skills
```http
POST /api/v1/user/skills/seeking
Authorization: Bearer <token>
Content-Type: application/json

{
  "skillId": "64a1b2c3d4e5f6789abcdef0"
}
```

### Remove Skill from Offered Skills
```http
DELETE /api/v1/user/skills/offered/:skillId
Authorization: Bearer <token>
```

### Remove Skill from Seeking Skills
```http
DELETE /api/v1/user/skills/seeking/:skillId
Authorization: Bearer <token>
```

### Find Users by Skill
```http
GET /api/v1/user/skills/:skillId/users?page=1&limit=10
Authorization: Bearer <token>
```

## 🧩 Skill Management Endpoints

### Get All Skills
```http
GET /api/v1/skills?category=programming&difficulty=beginner&search=javascript&page=1&limit=20
```

### Get Skill by ID
```http
GET /api/v1/skills/:id
```

### Create New Skill
```http
POST /api/v1/skills
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "JavaScript Programming",
  "category": "programming",
  "description": "Learn modern JavaScript development",
  "difficulty": "intermediate",
  "tags": ["javascript", "web-development", "programming"]
}
```

### Update Skill
```http
PUT /api/v1/skills/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Advanced JavaScript",
  "description": "Advanced JavaScript concepts and patterns"
}
```

### Delete Skill
```http
DELETE /api/v1/skills/:id
Authorization: Bearer <token>
```

### Get Skill Categories
```http
GET /api/v1/skills/categories
```

### Get Popular Skills
```http
GET /api/v1/skills/popular?limit=10
```

## 🔍 Matching Endpoints

### Find Skill Matches
```http
GET /api/v1/matching/matches?category=programming&page=1&limit=10
Authorization: Bearer <token>
```

### Find Skill Partners
```http
GET /api/v1/matching/skills/:skillId/partners?matchType=teachers&page=1&limit=10
Authorization: Bearer <token>
```

### Get Matching Statistics
```http
GET /api/v1/matching/stats
Authorization: Bearer <token>
```

## 📅 Session Management Endpoints

### Create Session
```http
POST /api/v1/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "student": "64a1b2c3d4e5f6789abcdef0",
  "skill": "64a1b2c3d4e5f6789abcdef1",
  "title": "JavaScript Fundamentals",
  "description": "Learn the basics of JavaScript programming",
  "scheduledDate": "2024-01-15T10:00:00.000Z",
  "duration": 60,
  "sessionType": "online",
  "meetingLink": "https://meet.google.com/abc-defg-hij"
}
```

### Get User Sessions
```http
GET /api/v1/sessions?status=pending&role=teacher&page=1&limit=10
Authorization: Bearer <token>
```

### Get Session by ID
```http
GET /api/v1/sessions/:id
Authorization: Bearer <token>
```

### Update Session
```http
PUT /api/v1/sessions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Advanced JavaScript Concepts",
  "description": "Deep dive into advanced JavaScript patterns",
  "scheduledDate": "2024-01-20T14:00:00.000Z",
  "duration": 90
}
```

### Confirm Session
```http
PATCH /api/v1/sessions/:id/confirm
Authorization: Bearer <token>
```

### Cancel Session
```http
PATCH /api/v1/sessions/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Schedule conflict"
}
```

### Complete Session
```http
PATCH /api/v1/sessions/:id/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Great session! Student showed excellent progress.",
  "rating": 5
}
```

### Get Session Statistics
```http
GET /api/v1/sessions/stats
Authorization: Bearer <token>
```

## ⚙️ Admin Endpoints

### Get All Users
```http
GET /api/v1/admin/users?page=1&limit=10&role=student&verified=false
Authorization: Bearer <admin-token>
```

### Verify User
```http
PATCH /api/v1/admin/users/:id/verify
Authorization: Bearer <admin-token>
```

### Deactivate User
```http
PATCH /api/v1/admin/users/:id/deactivate
Authorization: Bearer <admin-token>
```

### Get Pending Skills
```http
GET /api/v1/admin/skills/pending
Authorization: Bearer <admin-token>
```

### Approve Skill
```http
PATCH /api/v1/admin/skills/:id/approve
Authorization: Bearer <admin-token>
```

### Reject Skill
```http
DELETE /api/v1/admin/skills/:id/reject
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "Does not meet community guidelines"
}
```

### Get System Statistics
```http
GET /api/v1/admin/stats
Authorization: Bearer <admin-token>
```

### Remove Flagged Content
```http
POST /api/v1/admin/content/remove
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "contentId": "64a1b2c3d4e5f6789abcdef0",
  "type": "user"
}
```

## 📊 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "Full name must be between 2 and 50 characters",
    "Email must be a valid email address"
  ]
}
```

## 🔒 Authentication & Authorization

### User Roles
- **student**: Regular users who can teach and learn skills
- **faculty**: Faculty members with additional privileges
- **admin**: System administrators with full access

### JWT Token Structure
```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "role": "student",
  "iat": 1640995200,
  "exp": 1641081600
}
```

## 📧 Email Notifications

The system sends automated emails for:

- **Welcome Email**: Sent when users register
- **User Verification**: Sent when admin verifies a user
- **Session Created**: Sent to student when session is created
- **Session Confirmed**: Sent to teacher when session is confirmed
- **Skill Approved**: Sent when skill is approved by admin
- **Skill Rejected**: Sent when skill is rejected by admin

## 🛡️ Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin resource sharing
- **Role-based Access**: Different permissions for different user roles
- **Rate Limiting**: Built-in protection against abuse

## 🧪 Testing

### Health Check
```http
GET http://localhost:5000/
```

### API Health Check
```http
GET http://localhost:5000/api/v1/healthcheck
```

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
PORT=5000
CORS_ORIGIN=https://yourdomain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=SkillConnect <noreply@skillconnect.com>
```

### Production Considerations
- Use environment-specific configurations
- Set up proper logging
- Configure rate limiting
- Set up monitoring and alerts
- Use HTTPS in production
- Configure proper CORS origins

## 📝 API Rate Limits

- **Authentication**: 5 requests per minute
- **General API**: 100 requests per minute
- **Admin API**: 200 requests per minute

## 🐛 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Server error |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**SkillConnect Backend API** - Empowering campus skill exchange through technology! 🚀
