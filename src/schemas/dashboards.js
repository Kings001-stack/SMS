// Dashboard Schemas for SMS Application

export const studentDashboardSchema = {
  title: "Student Dashboard",
  description: "Access your assignments, resources, grades, and school announcements",
  role: "student",
  features: [
    {
      id: "overview",
      title: "Overview",
      icon: "home",
      description: "Dashboard overview and quick stats"
    },
    {
      id: "assignments",
      title: "Assignments",
      icon: "document-text",
      description: "View and submit your assignments"
    },
    {
      id: "resources",
      title: "Resources",
      icon: "book-open",
      description: "Access learning materials and resources"
    },
    {
      id: "announcements",
      title: "Announcements",
      icon: "megaphone",
      description: "Read school announcements and updates"
    },
    {
      id: "fees",
      title: "Fees",
      icon: "currency-dollar",
      description: "Check your fee balance and payment history"
    },
    {
      id: "calendar",
      title: "Calendar",
      icon: "calendar",
      description: "View school calendar and important dates"
    }
  ]
};

export const teacherDashboardSchema = {
  title: "Teacher Dashboard",
  description: "Manage your classes, share resources, and track student progress",
  role: "teacher",
  features: [
    {
      id: "overview",
      title: "Overview",
      icon: "home",
      description: "Dashboard overview and class statistics"
    },
    {
      id: "assignments",
      title: "Assignments",
      icon: "document-text",
      description: "Create and grade assignments"
    },
    {
      id: "resources",
      title: "Resources",
      icon: "book-open",
      description: "Share resources with your classes"
    },
    {
      id: "announcements",
      title: "Announcements",
      icon: "megaphone",
      description: "Post announcements to students"
    },
    {
      id: "grades",
      title: "Grades",
      icon: "chart-bar",
      description: "Manage student grades and feedback"
    },
    {
      id: "attendance",
      title: "Attendance",
      icon: "check-circle",
      description: "Mark and track student attendance"
    },
    {
      id: "calendar",
      title: "Calendar",
      icon: "calendar",
      description: "View and manage class schedule"
    }
  ]
};

export const adminDashboardSchema = {
  title: "Admin Dashboard",
  description: "Complete school system oversight and management",
  role: "admin",
  features: [
    {
      id: "overview",
      title: "Overview",
      icon: "home",
      description: "System overview and analytics"
    },
    {
      id: "admin-overview",
      title: "Admin Panel",
      icon: "cog",
      description: "System administration and monitoring"
    },
    {
      id: "user-management",
      title: "Users",
      icon: "users",
      description: "Manage users and permissions"
    },
    {
      id: "system-reports",
      title: "Reports",
      icon: "chart-line",
      description: "Generate system reports and analytics"
    },
    {
      id: "class-management",
      title: "Classes",
      icon: "academic-cap",
      description: "Create and manage school classes"
    },
    {
      id: "subject-management",
      title: "Subjects",
      icon: "book-open",
      description: "Create and manage subjects"
    },
    {
      id: "teacher-assignments",
      title: "Teacher Assignments",
      icon: "user-group",
      description: "Assign teachers to classes and subjects"
    },
    {
      id: "news-events",
      title: "News & Events",
      icon: "calendar",
      description: "Create and manage news and events"
    },
    {
      id: "assignments",
      title: "Assignments",
      icon: "document-text",
      description: "Oversee all assignments"
    },
    {
      id: "resources",
      title: "Resources",
      icon: "book-open",
      description: "Manage school resources"
    },
    {
      id: "announcements",
      title: "Announcements",
      icon: "megaphone",
      description: "Manage school announcements"
    },
    {
      id: "fees",
      title: "Fees",
      icon: "currency-dollar",
      description: "Financial management and oversight"
    }
  ]
};

export const parentDashboardSchema = {
  title: "Parent Dashboard",
  description: "Monitor your child's academic progress and school activities",
  role: "parent",
  features: [
    {
      id: "overview",
      title: "Overview",
      icon: "home",
      description: "Child's academic overview"
    },
    {
      id: "assignments",
      title: "Assignments",
      icon: "document-text",
      description: "View child's assignments and progress"
    },
    {
      id: "announcements",
      title: "Announcements",
      icon: "megaphone",
      description: "Read school announcements"
    },
    {
      id: "fees",
      title: "Fees",
      icon: "currency-dollar",
      description: "View and pay school fees"
    },
    {
      id: "calendar",
      title: "Calendar",
      icon: "calendar",
      description: "View school calendar and events"
    }
  ]
};

export const staffDashboardSchema = {
  title: "Staff Dashboard",
  description: "Access staff resources and school information",
  role: "staff",
  features: [
    {
      id: "overview",
      title: "Overview",
      icon: "home",
      description: "Staff dashboard overview"
    },
    {
      id: "announcements",
      title: "Announcements",
      icon: "megaphone",
      description: "Read staff announcements"
    },
    {
      id: "calendar",
      title: "Calendar",
      icon: "calendar",
      description: "View school calendar and events"
    }
  ]
};

export const accountantDashboardSchema = {
  title: "Accountant Dashboard",
  description: "Manage school finances and fee collection",
  role: "accountant",
  features: [
    {
      id: "overview",
      title: "Overview",
      icon: "home",
      description: "Financial overview and statistics"
    },
    {
      id: "fees",
      title: "Fees",
      icon: "currency-dollar",
      description: "Manage fee collection and payments"
    },
    {
      id: "announcements",
      title: "Announcements",
      icon: "megaphone",
      description: "Read financial announcements"
    },
    {
      id: "calendar",
      title: "Calendar",
      icon: "calendar",
      description: "View financial calendar and deadlines"
    }
  ]
};

export const registrarDashboardSchema = {
  title: "Registrar Dashboard",
  description: "Manage student records and academic administration",
  role: "registrar",
  features: [
    {
      id: "overview",
      title: "Overview",
      icon: "home",
      description: "Academic administration overview"
    },
    {
      id: "assignments",
      title: "Assignments",
      icon: "document-text",
      description: "Oversee academic assignments"
    },
    {
      id: "announcements",
      title: "Announcements",
      icon: "megaphone",
      description: "Manage academic announcements"
    },
    {
      id: "calendar",
      title: "Calendar",
      icon: "calendar",
      description: "Manage academic calendar"
    }
  ]
};