# School Management System (SMS) - Greenfield Academy

A comprehensive School Management System built with **React + Vite + Tailwind CSS** frontend and **PHP REST API** backend. Designed specifically for Nigerian Junior Secondary Schools (JSS 1-3).

## 🎯 Features

### ✅ Implemented Core Features
- **Authentication System**: Role-based login/register (Student, Teacher, Admin, Parent, Staff, Accountant, Registrar)
- **Fee Management**: Complete fee tracking, payment recording, and balance monitoring
- **Assignment System**: Teachers can create assignments, students can submit work
- **Resource Management**: Upload and share learning materials by class level
- **Announcements**: School-wide communication system with targeted audiences
- **Grade Management**: Assignment grading and student progress tracking
- **Dashboard System**: Role-specific dashboards with real-time data
- **🆕 Admin Dashboard**: Complete administrative oversight and system management
  - **System Overview**: Real-time statistics and performance monitoring
  - **User Management**: Full user administration (create, edit, delete, role management)
  - **Advanced Reports**: Academic, financial, user activity, and system health reports
  - **Data Export**: JSON/CSV export capabilities for comprehensive analysis

### 🚧 Coming Soon
- Attendance tracking
- Payment gateway integration (Paystack/Flutterwave)
- Email notifications
- Performance analytics
- Calendar and events management

### 🆕 Parent Dashboard (Frontend Implemented)
- Routes: `/dashboard/parent` and `/dashboard/parent/:section`
- Schema: `parentDashboardSchema` with features: `overview`, `assignments`, `announcements`, `fees`, `calendar`
- Components:
  - `src/components/parent/ParentOverview.jsx` – lists linked children
  - `src/components/parent/ParentFeesView.jsx` – select child → view fee balance and payments
  - Reuses `AnnouncementList.jsx` (parents see `parents` or `all` audience)
- Router integration: `FeatureRouter.jsx` renders ParentOverview (overview) and ParentFeesView (fees) when role is `parent`

Backend required to complete functionality:
- DB: add `parent_students` link table
- Endpoints (JWT + RBAC, role = parent only):
  - `GET /api/parent/children`
  - `GET /api/parent/fees?student_id=:id`
  - `GET /api/parent/fees/payments?student_id=:id`

## 🏗️ System Architecture

### Frontend (React)
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: Context API
- **Animations**: Framer Motion

### Backend (PHP)
- **API**: RESTful PHP API
- **Database**: MySQL
- **Authentication**: Token-based auth
- **Controllers**: Modular controller architecture

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- XAMPP or similar (Apache + MySQL + PHP)
- Modern web browser

### Frontend Setup
```bash
# Clone and install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
1. **Start XAMPP** and ensure Apache + MySQL are running
2. **Import Database Schema**:
   ```bash
   # Access phpMyAdmin (http://localhost/phpmyadmin)
   # Create database 'school_auth'
   # Import: /xampp/htdocs/api/schema.sql
   ```
3. **API is ready** at `http://localhost/api`

## 📁 Project Structure

```
SMS/
├── src/
│   ├── components/
│   │   ├── dashboard/          # Dashboard framework
│   │   ├── fees/              # Fee management
│   │   ├── assignments/       # Assignment system
│   │   ├── announcements/     # Communication
│   │   ├── resources/         # Resource management
│   │   ├── admin/             # 🆕 Admin oversight components
│   │   └── parent/            # 🆕 Parent dashboard components
│   ├── pages/
│   │   └── dashboards/        # Role-specific dashboards
│   ├── context/               # Auth & state management
│   └── schemas/               # Dashboard configurations
└── xampp/htdocs/api/
    ├── controllers/           # API controllers
    ├── schema.sql            # Database schema
    └── index.php             # Main API router
```

## 👥 User Roles & Permissions

### Students
- View assignments and submit work
- Check fee balances and payment history
- Access learning resources
- View grades and feedback
- Read school announcements

### Teachers
- Create and manage assignments
- Grade student submissions
- Upload learning resources
- Post announcements
- Track student progress

### Administrators
- **User Management**: Create, edit, delete users with role management
- **Financial Oversight**: Monitor fee collection and payment tracking
- **Advanced Reporting**: Generate academic, financial, user activity, and system health reports
- **Data Export**: Export comprehensive reports in JSON/CSV formats
- **System Administration**: Monitor system health and performance metrics
**Content Management**: Oversee all assignments, resources, and announcements

### Parents (Frontend ready; requires backend endpoints)
- View linked children
- View child-specific fees and payments
- Read announcements targeted to parents or all users
- (Optional, backend support needed) View child assignments/grades

## 🔧 Configuration

### Environment Variables
Update `.env` file with your API endpoints:
{{ ... }}
VITE_API_BASE_URL=http://localhost/api
VITE_API_LOGIN_URL=http://localhost/api/index.php/login
# ... other endpoints
```

### Database Configuration
Update `xampp/htdocs/api/DbConnect.php`:
```php
private $server = 'localhost';
private $dbname = 'school_auth';
private $user = 'root';
private $pass = '';
```

## 🎨 Customization

### School Branding
- Update logo in `src/assets/`
- Modify school name in dashboard schemas
- Customize color scheme in Tailwind config

### Nigerian School Features
- Supports JSS1-JSS3 class levels
- Nigerian Naira (₦) currency formatting
- Term-based academic calendar
- Local fee structure templates

## 🔒 Security Features
- Role-based access control
- Token-based authentication
- Input validation and sanitization
- SQL injection prevention
- CORS protection

## 📊 Database Schema

### Core Tables
- `users` - All system users with roles
- `assignments` - Teacher assignments
- `assignment_submissions` - Student submissions
- `resources` - Learning materials
- `fee_types` - Fee categories
- `student_fees` - Individual fee records
- `fee_payments` - Payment transactions
- `announcements` - School communications

### Parent-Student Linking (Required for Parent Dashboard)
Add the following table to link parent accounts to student accounts:

```sql
CREATE TABLE IF NOT EXISTS parent_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_parent_student (parent_id, student_id),
  CONSTRAINT fk_ps_parent FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ps_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Seed at least one `parent` user and link to existing students with rows in `parent_students`.

### Backend Endpoints (Parent Role)
- `GET /api/parent/children` → returns children linked to the authenticated parent
- `GET /api/parent/fees?student_id=:id` → returns fee totals/balance for child (validate link)
- `GET /api/parent/fees/payments?student_id=:id` → returns payments for child (validate link)

RBAC: Ensure the authenticated user has role `parent` and is linked to the `student_id` in all requests.

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run preview
```

### Server Requirements
- PHP 7.4+
- MySQL 5.7+
- Apache/Nginx
- SSL certificate (recommended)

## 🤝 Contributing

This SMS is designed for Nigerian Junior Secondary Schools. Contributions welcome for:
- Payment gateway integration
- Mobile app development
- Advanced reporting features
- Multi-language support

## 📄 License

Built for educational institutions. See LICENSE file for details.

## 🆘 Support

For technical support or customization requests, please contact the development team.

---

**Built with ❤️ by Emmanuel king**
