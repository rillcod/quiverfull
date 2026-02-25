# The Quiverfull School Management System

A comprehensive school management system built for The Quiverfull School, a Nigerian-based Montessori educational institution serving students from creche through Primary 6 (Basic 1-6).

## 🌟 Features

### Multi-Role Support
- **Parents**: View children's progress, pay fees, communicate with teachers
- **Teachers**: Manage classes, record grades, track attendance
- **Students**: Access grades, view assignments, see achievements
- **Administrators**: Comprehensive school management and analytics

### Core Functionality
- Student registration and enrollment management
- Real-time attendance tracking
- Academic progress monitoring and grade recording
- Fee payment system with Nigerian Naira support
- Parent-teacher communication platform
- Health records and emergency contact management
- Transport/bus route management
- Announcements and notifications system

### Public Website
- Multi-page public website (Home, About, Programs, Academics, Admissions, News & Events, Contact)
- Kids Zone — interactive educational activities for students (Reading, Math, Art, Music, World Explorer, Achievement Hall)

### Nigerian-Focused Design
- Culturally appropriate color schemes and imagery
- Support for local phone number formats (+234)
- Nigerian Naira (₦) currency integration
- Mobile-first design for Nigerian network conditions
- English language with local educational terminology

## 🚀 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom animations
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time subscriptions)
- **Icons**: Lucide React
- **Deployment**: Optimized for Netlify/Vercel

## 🎨 Design Philosophy

The system features a vibrant, kid-friendly interface with:
- Smooth animations and micro-interactions
- Age-appropriate color schemes for different user roles
- Intuitive navigation suitable for all age groups
- Mobile-responsive design
- Apple-level attention to detail and user experience

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## 🛠️ Setup Instructions

### 1. Clone and Install
```bash
git clone <repository-url>
cd quiverfull-school
npm install
```

### 2. Supabase Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your project URL and anonymous key
3. Copy `.env.example` to `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Database Migration
1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the content from `supabase/migrations/20250805133821_silver_swamp.sql`
3. Run the migration to create all necessary tables and security policies

### 4. Create Demo User Accounts
Since Supabase Auth requires actual user creation, manually create these demo accounts in the Supabase dashboard under Authentication > Users:

| Email | Password | Role |
|---|---|---|
| admin@quiverfullschool.ng | Admin123! | Administrator |
| teacher@quiverfullschool.ng | Teacher123! | Teacher |
| parent@quiverfullschool.ng | Parent123! | Parent |
| student@quiverfullschool.ng | Student123! | Student |

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to access the system.

## 🏗️ Database Schema

The system uses a comprehensive PostgreSQL schema with:

### Core Tables
- `profiles` - User profiles with role-based access
- `students` - Student information and enrollment data
- `classes` - Class/grade management
- `teachers` - Teacher profiles and qualifications
- `parents` - Parent information and relationships
- `attendance` - Daily attendance tracking
- `grades` - Academic performance records
- `fees` - Fee structure and payment tracking
- `announcements` - School communications
- `health_records` - Student medical information
- `transport` - Bus routes and transportation

### Security Features
- Row Level Security (RLS) enabled on all tables
- Role-based access policies
- Data encryption and secure authentication
- Audit trails for sensitive operations

## 👥 User Roles & Permissions

### Parents
- View their children's academic progress
- Track attendance and grades
- Pay school fees online
- Communicate with teachers
- Access school announcements

### Teachers
- Manage assigned classes
- Record student grades and attendance
- Create lesson plans and assignments
- Communicate with parents
- Generate progress reports

### Students (age-appropriate features)
- View their own grades and attendance
- Access learning materials
- See achievements and rewards
- View class schedule

### Administrators
- Complete school management access
- Student and staff management
- Financial reporting and analytics
- System configuration
- Data export and backup

## 🎯 Nigerian Education Integration

### Academic Structure
- Supports Nigerian educational levels (Creche to Basic 6)
- Term-based academic calendar
- NERDC curriculum alignment
- Local assessment methods

### Cultural Features
- Nigerian color themes (Green, White)
- Local currency support (Naira ₦)
- Cultural imagery and icons
- Support for local naming conventions

## 📱 Mobile Optimization

- Progressive Web App (PWA) capabilities
- Offline functionality for essential features
- Optimized for low-bandwidth connections
- Touch-friendly interface design
- Fast loading with image optimization

## 🔧 Development

### File Structure
```
src/
├── components/
│   ├── auth/                   # Authentication components
│   │   ├── AuthLayout.tsx
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboards/             # Role-specific dashboards
│   │   ├── AdminDashboard.tsx
│   │   ├── ParentDashboard.tsx
│   │   ├── StudentDashboard.tsx
│   │   └── TeacherDashboard.tsx
│   ├── kids/                   # Kids Zone interactive area
│   │   ├── KidsButton.tsx
│   │   ├── KidsLanding.tsx
│   │   └── activities/
│   │       ├── AchievementHall.tsx
│   │       ├── ArtStudio.tsx
│   │       ├── MathFun.tsx
│   │       ├── MusicRoom.tsx
│   │       ├── ReadingCorner.tsx
│   │       └── WorldExplorer.tsx
│   └── website/                # Public-facing website
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── MainWebsite.tsx
│       ├── HeroSection.tsx
│       ├── AboutSection.tsx
│       ├── ProgramsSection.tsx
│       ├── AdmissionsSection.tsx
│       ├── TestimonialsSection.tsx
│       ├── ContactSection.tsx
│       └── pages/
│           ├── HomePage.tsx
│           ├── AboutPage.tsx
│           ├── AcademicsPage.tsx
│           ├── AdmissionsPage.tsx
│           ├── ContactPage.tsx
│           ├── NewsEventsPage.tsx
│           └── ProgramsPage.tsx
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   └── useSounds.ts
├── lib/                        # Utilities and configurations
│   └── supabase.ts
├── App.tsx
├── main.tsx
└── index.css
```

### Key Components
- `App.tsx` - Root component; handles routing between website, auth, dashboards, and Kids Zone
- `MainWebsite` - Public website shell with Header, Footer, and page routing
- `Header` - Sticky navigation bar with top contact bar, nav links, and Kids Zone button
- `AuthLayout` - Shared authentication card wrapper
- `LoginForm` / `RegisterForm` - Sign-in and registration forms
- `ParentDashboard` - Parent portal with child tracking and fee management
- `TeacherDashboard` - Classroom management interface
- `AdminDashboard` - Administrative control panel
- `StudentDashboard` - Kid-friendly student interface
- `KidsLanding` - Interactive Kids Zone with six educational activity rooms

## 🚀 Deployment

### For Nigerian Hosting
1. Build the project: `npm run build`
2. Deploy to Netlify, Vercel, or local Nigerian hosting providers
3. Configure environment variables on hosting platform
4. Set up custom domain (recommended: .ng or .com.ng)

### Production Considerations
- Enable Supabase production mode
- Configure backup schedules
- Set up monitoring and alerts
- Implement CDN for static assets
- Configure SSL certificates

## 🔒 Security Features

- Multi-factor authentication support
- Role-based access control (RBAC)
- Data encryption at rest and in transit
- Regular security audits
- GDPR/Nigerian data protection compliance
- Secure payment processing integration

## 📊 Analytics & Reporting

- Student performance analytics
- Attendance trend analysis
- Financial reporting and fee tracking
- Parent engagement metrics
- Teacher productivity insights
- School-wide performance dashboards

## 🆘 Support & Maintenance

### Common Issues
- Authentication problems: Check Supabase configuration and ensure demo accounts are created
- Database connection issues: Verify environment variables in `.env`
- UI rendering problems: Clear browser cache
- Mobile display issues: Check responsive CSS

### Updates
- Regular dependency updates
- Security patch management
- Feature enhancement releases
- Bug fix deployments

## 📞 Contact & Support

For technical support or customization requests:
- Email: support@quiverfullschool.ng
- Phone: +234 XXX XXX XXXX
- Address: Lagos, Nigeria

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Nigerian Ministry of Education for curriculum guidelines
- Montessori education methodology
- Open source community contributors
- Nigerian educational technology pioneers

---

Built with ❤️ for Nigerian education by The Quiverfull School Team
