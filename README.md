# StaffHub - Web-Based Staff Management System

A complete, production-quality frontend application for university Software Engineering project.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📋 Features

- **Authentication** - Mock login with 6 role-based demo accounts
- **Employee Management** - Full CRUD with search, filters, pagination
- **Attendance Tracking** - Daily records, summaries, status filters
- **Leave Management** - Request, approve, reject, cancel with balance tracking
- **Performance Reviews** - KPI tracking, ratings, charts
- **Training Programs** - Create, register, manage capacity
- **Event Management** - Create, register, capacity tracking
- **Grievances & Feedback** - Submit, respond, status workflow
- **Notifications** - Read/unread, mark as read, type filters
- **Reports** - Generate mock reports with date range and format selection
- **Profile & Settings** - Edit profile, notification preferences, appearance

## 🔑 Demo Login Accounts

| Role | Email | Password |
|------|-------|----------|
| Employee | employee@staffhub.com | demo123 |
| HR Manager | hr@staffhub.com | demo123 |
| Department Manager | manager@staffhub.com | demo123 |
| Training Coordinator | training@staffhub.com | demo123 |
| Grievance Officer | grievance@staffhub.com | demo123 |
| Event Organizer | events@staffhub.com | demo123 |

> ⚠️ These are development-only accounts. Never use in production.

## 🏗️ Project Structure

```
src/
  config/          # Roles, permissions, navigation, app config
  contexts/        # AuthContext, ToastContext
  data/mock/       # All mock data (employees, attendance, etc.)
  layouts/         # DashboardLayout, AuthLayout
  pages/           # All page components
  routes/          # ProtectedRoute, PermissionRoute
  services/        # API client + all service modules
  components/ui/   # Reusable UI components
  App.tsx          # Main app with routing
  main.tsx         # Entry point
  index.css        # Global styles
```

## 🔧 Technology

- **React 19** - UI framework
- **Vite 7** - Build tool
- **React Router 7** - Client-side routing
- **Tailwind CSS 4** - Utility-first CSS
- **Lucide React** - Icon library
- **Recharts** - Chart library
- **TypeScript** - Type safety

## 🌐 Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables if needed

## 🔗 Backend Integration

See [API_INTEGRATION.md](./API_INTEGRATION.md) and [AUTH_INTEGRATION.md](./AUTH_INTEGRATION.md) for detailed guides on connecting to a real backend.

## 📖 Development Guide

See [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for architecture explanations and how to extend the application.
