# SkillConnect API Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Skill Management](#skill-management)
5. [Matching System](#matching-system)
6. [Session Management](#session-management)
7. [Admin Panel](#admin-panel)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)

## Overview

SkillConnect is a campus peer-to-peer skill exchange platform that connects students and faculty for skill sharing and learning.

**Base URL**: `http://localhost:5000/api/v1`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Register User
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "linkedin": "https://linkedin.com/in/johndoe"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789abcdef0",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### Login User
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789abcdef0",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

## User Management

### Get User Profile
```http
GET /api/v1/user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "64a1b2c3d4e5f6789abcdef0",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "linkedin": "https://linkedin.com/in/johndoe",
    "skillsOffered": [
      {
        "_id": "64a1b2c3d4e5f6789abcdef1",
        "name": "JavaScript Programming",
        "category": "programming",
        "description": "Learn modern JavaScript development"
      }
    ],
    "skillsSeeking": [
      {
        "_id": "64a1b2c3d4e5f6789abcdef2",
        "name": "Python Programming",
        "category": "programming",
        "description": "Learn Python for data science"
      }
    ],
    "isVerified": true
  },
  "message": "User profile fetched successfully"
}
```

### Update User Profile
```http
PUT /api/v1/user/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Smith",
  "linkedin": "https://linkedin.com/in/johnsmith"
}
```

### Add Skill to Offered Skills
```http
POST /api/v1/user/skills/offered
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "skillId": "64a1b2c3d4e5f6789abcdef1"
}
```

### Add Skill to Seeking Skills
```http
POST /api/v1/user/skills/seeking
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "skillId": "64a1b2c3d4e5f6789abcdef2"
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

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "skill": {
      "_id": "64a1b2c3d4e5f6789abcdef1",
      "name": "JavaScript Programming",
      "category": "programming"
    },
    "users": [
      {
        "_id": "64a1b2c3d4e5f6789abcdef3",
        "fullName": "Jane Doe",
        "email": "jane@example.com",
        "role": "student",
        "skillsOffered": [...],
        "skillsSeeking": [...]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalUsers": 25,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Users offering this skill fetched successfully"
}
```

## Skill Management

### Get All Skills
```http
GET /api/v1/skills?category=programming&difficulty=beginner&search=javascript&page=1&limit=20
```

**Query Parameters:**
- `category`: Filter by skill category
- `difficulty`: Filter by difficulty level
- `search`: Search in skill name, description, or tags
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "skills": [
      {
        "_id": "64a1b2c3d4e5f6789abcdef1",
        "name": "JavaScript Programming",
        "category": "programming",
        "description": "Learn modern JavaScript development",
        "difficulty": "beginner",
        "tags": ["javascript", "web-development"],
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalSkills": 100,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Skills fetched successfully"
}
```

### Get Skill by ID
```http
GET /api/v1/skills/:id
```

### Create New Skill
```http
POST /api/v1/skills
Authorization: Bearer <token>
```

**Request Body:**
```json
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
```

**Request Body:**
```json
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

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    "programming",
    "design",
    "marketing",
    "business",
    "language",
    "music",
    "art",
    "photography",
    "writing",
    "data-science",
    "other"
  ],
  "message": "Categories fetched successfully"
}
```

### Get Popular Skills
```http
GET /api/v1/skills/popular?limit=10
```

## Matching System

### Find Skill Matches
```http
GET /api/v1/matching/matches?category=programming&page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "matches": [
      {
        "user": {
          "_id": "64a1b2c3d4e5f6789abcdef3",
          "fullName": "Jane Doe",
          "email": "jane@example.com",
          "role": "student"
        },
        "matchType": "teaching_opportunity",
        "commonSkills": [
          {
            "_id": "64a1b2c3d4e5f6789abcdef1",
            "name": "JavaScript Programming",
            "category": "programming"
          }
        ],
        "compatibilityScore": 85
      }
    ],
    "totalMatches": 15,
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    },
    "userSkills": {
      "offered": [...],
      "seeking": [...]
    }
  },
  "message": "Skill matches found successfully"
}
```

### Find Skill Partners
```http
GET /api/v1/matching/skills/:skillId/partners?matchType=teachers&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `matchType`: "teachers", "learners", or "all"
- `page`: Page number
- `limit`: Items per page

### Get Matching Statistics
```http
GET /api/v1/matching/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "userStats": {
      "offeredSkills": 5,
      "seekingSkills": 3
    },
    "matchingOpportunities": {
      "teachingOpportunities": 12,
      "learningOpportunities": 8,
      "mutualExchanges": 3,
      "totalOpportunities": 23
    },
    "skillCategories": {
      "offered": {
        "programming": 3,
        "design": 2
      },
      "seeking": {
        "business": 2,
        "language": 1
      }
    }
  },
  "message": "Matching statistics retrieved successfully"
}
```

## Session Management

### Create Session
```http
POST /api/v1/sessions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "student": "64a1b2c3d4e5f6789abcdef3",
  "skill": "64a1b2c3d4e5f6789abcdef1",
  "title": "JavaScript Fundamentals",
  "description": "Learn the basics of JavaScript programming",
  "scheduledDate": "2024-01-15T10:00:00.000Z",
  "duration": 60,
  "sessionType": "online",
  "location": "Online",
  "meetingLink": "https://meet.google.com/abc-defg-hij"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "_id": "64a1b2c3d4e5f6789abcdef4",
    "teacher": {
      "_id": "64a1b2c3d4e5f6789abcdef0",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "student": {
      "_id": "64a1b2c3d4e5f6789abcdef3",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "role": "student"
    },
    "skill": {
      "_id": "64a1b2c3d4e5f6789abcdef1",
      "name": "JavaScript Programming",
      "category": "programming",
      "description": "Learn modern JavaScript development"
    },
    "title": "JavaScript Fundamentals",
    "description": "Learn the basics of JavaScript programming",
    "scheduledDate": "2024-01-15T10:00:00.000Z",
    "duration": 60,
    "sessionType": "online",
    "location": "Online",
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Session created successfully"
}
```

### Get User Sessions
```http
GET /api/v1/sessions?status=pending&role=teacher&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by session status
- `role`: Filter by user role (teacher/student)
- `page`: Page number
- `limit`: Items per page

### Get Session by ID
```http
GET /api/v1/sessions/:id
Authorization: Bearer <token>
```

### Update Session
```http
PUT /api/v1/sessions/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
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
```

**Request Body:**
```json
{
  "reason": "Schedule conflict"
}
```

### Complete Session
```http
PATCH /api/v1/sessions/:id/complete
Authorization: Bearer <token>
```

**Request Body:**
```json
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

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "totalSessions": 25,
    "completedSessions": 20,
    "pendingSessions": 3,
    "confirmedSessions": 2,
    "averageRatings": {
      "asTeacher": 4.8,
      "asStudent": 4.5
    }
  },
  "message": "Session statistics retrieved successfully"
}
```

## Admin Panel

### Get All Users
```http
GET /api/v1/admin/users?page=1&limit=10&role=student&verified=false
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `role`: Filter by user role
- `verified`: Filter by verification status

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
```

**Request Body:**
```json
{
  "reason": "Does not meet community guidelines"
}
```

### Get System Statistics
```http
GET /api/v1/admin/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "users": {
      "total": 150,
      "verified": 120
    },
    "skills": {
      "total": 75,
      "active": 70
    },
    "sessions": {
      "total": 300,
      "completed": 250
    }
  },
  "message": "System statistics fetched successfully"
}
```

### Remove Flagged Content
```http
POST /api/v1/admin/content/remove
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "contentId": "64a1b2c3d4e5f6789abcdef0",
  "type": "user"
}
```

## Error Handling

### Error Response Format
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

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Server error |

### Validation Errors

The API uses express-validator for input validation. Common validation rules:

- **Email**: Must be a valid email address
- **Password**: Minimum 6 characters
- **Full Name**: 2-50 characters
- **Skill Name**: 2-50 characters
- **Description**: 10-500 characters
- **Duration**: 15-480 minutes
- **MongoDB IDs**: Must be valid ObjectId format

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **General API endpoints**: 100 requests per minute
- **Admin endpoints**: 200 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

Most list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Email Notifications

The system sends automated emails for various events:

- **Welcome Email**: User registration
- **User Verification**: Admin verification
- **Session Created**: New session created
- **Session Confirmed**: Session confirmation
- **Skill Approved**: Skill approval
- **Skill Rejected**: Skill rejection

Email templates are customizable and support HTML formatting.

---

**Note**: This documentation is for API version 1.0. All endpoints are prefixed with `/api/v1`.



