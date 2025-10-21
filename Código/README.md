# NPS Evaluation Platform

A comprehensive Net Promoter Score (NPS) application that allows admins to create custom evaluation questions and users to provide feedback, with robust analytics and reporting capabilities.

## Features

### Admin Features
- **Dashboard Overview**: View key metrics including active questions, total responses, active users, and NPS score
- **Question Management**: Create, edit, delete, and toggle NPS questions with unique IDs
- **User Management**: Add, edit, and delete users with role assignment (admin/user)
- **Analytics Dashboard**: Visual representation of NPS data with filtering by question and satisfaction level
- **Export Reports**: Generate and download reports in CSV format (PDF support ready for integration)

### User Features
- **User Dashboard**: View available evaluations, completed responses, and pending evaluations
- **Evaluations**: Respond to NPS questions with three rating levels (Good, Regular, Bad) and optional comments
- **Response History**: Track all submitted evaluations with timestamps

## Demo Credentials

### Admin Access
- **Email**: admin@example.com
- **Password**: admin123

### User Access
- **Email**: user@example.com
- **Password**: user123

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Application Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx    # Main layout wrapper
│   │   └── Navigation.tsx         # Navigation menu
│   └── ui/                        # shadcn/ui components
├── contexts/
│   ├── AuthContext.tsx            # Authentication state
│   └── NPSContext.tsx             # NPS data management
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.tsx     # Admin overview
│   │   ├── QuestionsPage.tsx      # Question management
│   │   ├── UsersPage.tsx          # User management
│   │   ├── AnalyticsPage.tsx      # Analytics & charts
│   │   └── ReportsPage.tsx        # Export functionality
│   ├── user/
│   │   ├── UserDashboard.tsx      # User overview
│   │   └── EvaluationsPage.tsx    # Answer evaluations
│   └── LoginPage.tsx              # Authentication
├── types/
│   └── nps.ts                     # TypeScript interfaces
└── App.tsx                        # Main app with routing
```

## Key Features Implementation

### Authentication
- Mock authentication system with role-based access control
- Persistent sessions using localStorage
- Protected routes for admin and user areas

### Data Management
- Local state management using React Context
- Data persistence with localStorage
- Mock data for demonstration purposes

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive navigation with mobile drawer
- Adaptive layouts for all screen sizes

### User Experience
- Intuitive card-based layouts
- Visual feedback with toast notifications
- Color-coded rating system (Green/Yellow/Red)
- Smooth transitions and hover effects

## Future Enhancements

- Backend integration with Supabase or similar
- Real-time updates with WebSockets
- Advanced analytics with chart libraries (Chart.js, Recharts)
- PDF report generation with jsPDF
- Email notifications for new evaluations
- Multi-language support
- Dark mode theme
- Advanced filtering and search
- Export to Excel format
- Scheduled reports

## License

MIT