# SkillConnect Frontend

A modern React + TypeScript frontend for the SkillConnect campus skill exchange platform.

## 🚀 Features

- **Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Component Library**: Comprehensive UI components using shadcn/ui
- **Authentication**: JWT-based authentication with context management
- **State Management**: React Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Responsive Design**: Mobile-first responsive design
- **Type Safety**: Full TypeScript support throughout

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **React Router** - Client-side routing
- **Lucide React** - Icons

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Configure environment variables:**
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_APP_NAME=SkillConnect
   VITE_APP_VERSION=1.0.0
   VITE_NODE_ENV=development
   ```

## 🚀 Development

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Preview production build:**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── Layout.tsx      # Main layout component
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── api.ts         # API client and types
│   └── utils.ts       # Utility functions
├── pages/              # Page components
│   ├── Auth.tsx       # Authentication page
│   ├── Dashboard.tsx  # User dashboard
│   ├── Profile.tsx    # User profile
│   ├── Sessions.tsx   # Session management
│   ├── Skills.tsx     # Skill management
│   └── Admin.tsx      # Admin panel
└── App.tsx            # Main app component
```

## 🔧 Configuration

### API Integration

The frontend connects to the backend API through the `lib/api.ts` file. Make sure your backend is running on the configured URL.

### Authentication

Authentication is handled through the `AuthContext` which provides:
- User login/logout
- Token management
- Protected routes
- User state management

### Styling

The app uses Tailwind CSS with custom design tokens defined in `global.css`. The design system includes:
- Brand colors and gradients
- Consistent spacing and typography
- Dark mode support
- Responsive breakpoints

## 🎨 UI Components

The app uses a comprehensive set of UI components from shadcn/ui:
- Forms and inputs
- Data tables
- Modals and dialogs
- Navigation components
- Feedback components (toasts, alerts)

## 🔐 Security

- JWT token management
- Protected routes
- Input validation with Zod
- XSS protection
- CSRF protection through API integration

## 📱 Responsive Design

The app is fully responsive with:
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interactions
- Adaptive layouts

## 🚀 Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder to your hosting service**

3. **Configure environment variables in production**

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add proper error handling
4. Write meaningful commit messages
5. Test your changes thoroughly

## 📄 License

This project is part of the SkillConnect platform.
