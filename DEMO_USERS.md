# Demo User Accounts for The Quiverfull School Management System

## 🔐 Login Credentials

### Administrator Account
- **Email**: `admin@quiverfullschool.ng`
- **Password**: `Admin123!`
- **Role**: Administrator
- **Access**: Full system administration, staff management, financial reports, analytics

### Teacher Account
- **Email**: `teacher@quiverfullschool.ng`
- **Password**: `Teacher123!`
- **Role**: Teacher
- **Access**: Class management, grade recording, attendance tracking, parent communication

### Parent Account
- **Email**: `parent@quiverfullschool.ng`
- **Password**: `Parent123!`
- **Role**: Parent
- **Access**: Child's progress, fee payments, teacher communication, school announcements

### Student Account
- **Email**: `student@quiverfullschool.ng`
- **Password**: `Student123!`
- **Role**: Student
- **Access**: Personal grades, assignments, profile management, educational activities

## 🎯 Student Portal Features

### Role-Based Access Control
The student portal implements three levels of access:

1. **Basic Student** - View personal information, courses, and grades
2. **Active Student** - Basic permissions plus ability to update profile and submit assignments
3. **Advanced Student** - Full access plus additional resources and peer collaboration features

### Content Management
- Students can only access their own academic data
- Secure authentication prevents unauthorized access
- Clear navigation between dashboard sections
- Age-appropriate interface design

### Security Features
- Row Level Security (RLS) policies ensure data isolation
- Students cannot view other students' information
- Proper authentication and authorization checks
- Secure session management

## 📚 Sample Data (requires database connection)

### Student Profile
- **Name**: Kemi Johnson
- **Student ID**: QFS2024001
- **Class**: Sunshine Class (Basic 3)
- **Academic Year**: 2024/2025

### Academic Records
- Mathematics Quiz: 18/20 (90%)
- English Test: 85/100 (85%)
- Science Project: 92/100 (92%)
- Social Studies Assignment: 16/20 (80%)

### Assignments
- Math Worksheet - Addition (Due: Jan 10, 2025)
- Science Project - Plants (Submitted)

### Attendance
- Perfect attendance for current week
- 98% overall attendance rate

## 🚀 Getting Started

1. **Access the System**: Navigate to the deployed application
2. **Choose User Type**: Select from the demo accounts above
3. **Login**: Use the provided credentials
4. **Explore Features**: Each role has different capabilities and views
5. **Test Functionality**: Try various features like grade viewing, assignment submission, etc.

## 🔒 Security Notes

- All demo passwords follow strong password policies
- Real deployment should use environment-specific credentials
- Database includes proper RLS policies for data protection
- Authentication is handled securely through Supabase

> **Database Required**: Login and dashboard features require a connected Supabase database.
> Follow the setup steps in `README.md` to run the migration and create the demo accounts before testing.
> The public website and Kids Zone work without a database connection.

## 📱 Mobile Compatibility

- All interfaces are fully responsive
- Touch-friendly design for tablets and phones
- Optimized for various screen sizes
- Fast loading on mobile networks

## 🎨 Design Features

- Kid-friendly, colorful interface for students
- Professional design for parents and teachers
- Smooth animations and transitions
- Intuitive navigation for all age groups
- Nigerian cultural elements and local language support

---

**Note**: These are demo accounts for testing purposes. In a production environment, users would register through the proper channels and receive their own unique credentials.