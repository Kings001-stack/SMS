-- schema.sql
-- School Management System Database Schema

-- Use the existing database
USE school_auth;

-- 1) Ensure users has role and class_level
-- Adjust column positions as you prefer; AFTER clauses are optional.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'student' AFTER email,
  ADD COLUMN IF NOT EXISTS class_level VARCHAR(10) NULL AFTER role;

-- Optional: constrain class_level via a separate lookup table if you prefer normalization
-- For quick validation in PHP, we'll use a constant list.

-- Helpful indexes for users
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_class_level ON users(class_level);

-- Parent-Student linking table
CREATE TABLE IF NOT EXISTS parent_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_parent_student (parent_id, student_id),
  CONSTRAINT fk_ps_parent FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ps_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 2) Create-- Teacher-Class relationships table
CREATE TABLE teacher_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    class_level ENUM('JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3') NOT NULL,
    subject VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_class_subject (teacher_id, class_level, subject)
);

-- Resources table for learning materials (Enhanced with File Upload and Text Content)
CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100),
    class_level ENUM('JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3') NOT NULL,
    content_type ENUM('file', 'text') NOT NULL DEFAULT 'text',
    file_path VARCHAR(500) NULL,
    file_name VARCHAR(255) NULL,
    file_size INT DEFAULT 0,
    file_type VARCHAR(50) NULL,
    text_content LONGTEXT NULL,
    is_assignment BOOLEAN DEFAULT FALSE,
    due_date DATETIME NULL,
    visibility ENUM('class', 'subject', 'public') DEFAULT 'class',
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_class_level (class_level),
    INDEX idx_subject (subject),
    INDEX idx_visibility (visibility),
    INDEX idx_teacher_class (teacher_id, class_level)
);

-- Helpful indexes for resources
CREATE INDEX IF NOT EXISTS idx_resources_class_level ON resources(class_level);
CREATE INDEX IF NOT EXISTS idx_resources_teacher_id ON resources(teacher_id);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);

-- 3) Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  subject VARCHAR(100) NULL,
  class_level VARCHAR(10) NOT NULL, -- must be one of: JSS1,JSS2,JSS3,SS1,SS2,SS3
  due_date DATETIME NOT NULL,
  status ENUM('draft', 'active', 'completed', 'overdue') DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_assignments_teacher FOREIGN KEY (teacher_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Helpful indexes for assignments
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_level ON assignments(class_level);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_created_at ON assignments(created_at);

-- 4) Create grades table
CREATE TABLE IF NOT EXISTS grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  student_id INT NOT NULL,
  assignment_id INT NOT NULL,
  grade VARCHAR(10) NOT NULL, -- A, B, C, D, F or numeric score (e.g., 85, 92.5)
  comments TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_grades_teacher FOREIGN KEY (teacher_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_grades_student FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_grades_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Helpful indexes for grades
CREATE INDEX IF NOT EXISTS idx_grades_teacher_id ON grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_assignment_id ON grades(assignment_id);
CREATE INDEX IF NOT EXISTS idx_grades_created_at ON grades(created_at);

-- 5) Create attendance table (optional, for future use)
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  class_date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Helpful indexes for attendance
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance(class_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

-- 6) Create announcements table (optional, for future use)
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  target_audience ENUM('all', 'teachers', 'students', 'parents') DEFAULT 'all',
  priority ENUM('normal', 'high', 'urgent') DEFAULT 'normal',
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_announcements_teacher FOREIGN KEY (teacher_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Helpful indexes for announcements
CREATE INDEX IF NOT EXISTS idx_announcements_teacher_id ON announcements(teacher_id);
CREATE INDEX IF NOT EXISTS idx_announcements_target_audience ON announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);

-- 6b) Create news_events table for News & Events page
CREATE TABLE IF NOT EXISTS news_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('news','event') NOT NULL DEFAULT 'news',
  event_date DATETIME NULL,
  published TINYINT(1) NOT NULL DEFAULT 1,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_news_events_created_by FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_news_events_published ON news_events(published);
CREATE INDEX IF NOT EXISTS idx_news_events_type ON news_events(type);
CREATE INDEX IF NOT EXISTS idx_news_events_event_date ON news_events(event_date);

-- 7) Create fee_types table (for different fee categories)
CREATE TABLE IF NOT EXISTS fee_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default fee types for Nigerian JSS schools
INSERT IGNORE INTO fee_types (name, description, amount) VALUES
('Tuition Fee', 'Quarterly tuition fee', 25000.00),
('Development Levy', 'School development contribution', 5000.00),
('Examination Fee', 'Internal and external examination fees', 3000.00),
('Sports Fee', 'Sports and recreational activities', 2000.00),
('Library Fee', 'Library maintenance and books', 1500.00);

-- Insert sample data for testing
INSERT IGNORE INTO users (name, email, password, role, class_level) VALUES
('John Student', 'student@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'JSS2'),
('Jane Teacher', 'teacher@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', NULL),
('Admin User', 'admin@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL),
('Math Teacher', 'math@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', NULL),
('English Teacher', 'english@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', NULL),
('Sarah Student', 'sarah@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'JSS1'),
('Mike Student', 'mike@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'JSS3');

-- Seed a sample parent user
INSERT IGNORE INTO users (name, email, password, role, class_level) VALUES
('Paula Parent', 'parent@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'parent', NULL);

-- Link the parent to two students (IDs based on seeds above: 1=John Student, 6=Sarah Student, 7=Mike Student)
INSERT IGNORE INTO parent_students (parent_id, student_id) VALUES
((SELECT id FROM users WHERE email='parent@test.com' LIMIT 1), (SELECT id FROM users WHERE email='student@test.com' LIMIT 1)),
((SELECT id FROM users WHERE email='parent@test.com' LIMIT 1), (SELECT id FROM users WHERE email='sarah@test.com' LIMIT 1));

-- Insert sample teacher-class relationships
INSERT INTO teacher_classes (teacher_id, class_level, subject, is_primary) VALUES
(2, 'JSS1', 'Mathematics', TRUE),
(2, 'JSS2', 'Mathematics', TRUE),
(4, 'JSS1', 'Mathematics', FALSE),
(4, 'JSS2', 'Mathematics', FALSE),
(4, 'JSS3', 'Mathematics', TRUE),
(5, 'JSS1', 'English Language', TRUE),
(5, 'JSS2', 'English Language', TRUE),
(5, 'JSS3', 'English Language', TRUE);

-- Insert sample assignments
INSERT INTO assignments (teacher_id, title, description, subject, class_level, due_date, status) VALUES
(2, 'Algebra Basics', 'Complete exercises 1-10 on algebraic expressions', 'Mathematics', 'JSS2', '2024-02-15 23:59:59', 'active'),
(4, 'Geometry Problems', 'Solve the triangle and circle problems in chapter 5', 'Mathematics', 'JSS3', '2024-02-20 23:59:59', 'active'),
(5, 'Essay Writing', 'Write a 300-word essay on "My School"', 'English Language', 'JSS1', '2024-02-18 23:59:59', 'active'),
(5, 'Grammar Exercise', 'Complete the tenses worksheet', 'English Language', 'JSS2', '2024-02-22 23:59:59', 'active');

-- Insert sample announcements
INSERT INTO announcements (teacher_id, title, content, target_audience, priority, is_active) VALUES
(3, 'Welcome to New Term', 'Welcome back students! We are excited to start the new academic term. Please ensure you have all your textbooks and materials ready.', 'all', 'normal', TRUE),
(2, 'Mathematics Competition', 'We are organizing a mathematics competition for all JSS students. Registration is now open. See your class teacher for details.', 'students', 'high', TRUE),
(5, 'English Club Meeting', 'The English Literary Club will meet every Friday after school. All students interested in improving their English skills are welcome.', 'students', 'normal', TRUE),
(3, 'Emergency: School Closure', 'Due to unexpected circumstances, the school will be closed tomorrow. All students should stay at home and await further instructions.', 'all', 'urgent', TRUE),
(3, 'Parent-Teacher Meeting', 'Parent-Teacher meetings are scheduled for next week. Please check the notice board for your appointment time.', 'parents', 'normal', TRUE);

-- Insert sample student fees
INSERT INTO student_fees (student_id, fee_type_id, academic_term, amount_due, amount_paid, due_date, status) VALUES
(1, 1, '2024-1st-term', 25000.00, 15000.00, '2024-03-01', 'partial'),
(1, 2, '2024-1st-term', 5000.00, 0.00, '2024-03-01', 'pending'),
(1, 3, '2024-1st-term', 3000.00, 3000.00, '2024-03-01', 'paid'),
(6, 1, '2024-1st-term', 25000.00, 25000.00, '2024-03-01', 'paid'),
(6, 2, '2024-1st-term', 5000.00, 5000.00, '2024-03-01', 'paid'),
(7, 1, '2024-1st-term', 25000.00, 10000.00, '2024-03-01', 'partial'),
(7, 2, '2024-1st-term', 5000.00, 0.00, '2024-03-01', 'pending');

-- Insert sample resources
INSERT IGNORE INTO resources (teacher_id, title, description, subject, class_level, file_url, file_type, visibility) VALUES
(2, 'Algebra Study Guide', 'Comprehensive guide to algebraic expressions and equations', 'Mathematics', 'JSS2', '/uploads/algebra-guide.pdf', 'pdf', 'class'),
(4, 'Geometry Formulas', 'Quick reference sheet for geometry formulas', 'Mathematics', 'JSS3', '/uploads/geometry-formulas.pdf', 'pdf', 'class'),
(5, 'English Grammar Rules', 'Basic grammar rules and examples', 'English Language', 'JSS1', '/uploads/grammar-rules.pdf', 'pdf', 'subject'),
(5, 'Vocabulary Builder', 'List of important vocabulary words for JSS students', 'English Language', 'JSS2', '/uploads/vocabulary.pdf', 'pdf', 'public');

-- 8) Create student_fees table (tracks individual student fee obligations)
CREATE TABLE IF NOT EXISTS student_fees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  fee_type_id INT NOT NULL,
  academic_term VARCHAR(20) NOT NULL, -- e.g., '2024-1st-term', '2024-2nd-term'
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0.00,
  due_date DATE NOT NULL,
  status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_fees_student FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_student_fees_fee_type FOREIGN KEY (fee_type_id) REFERENCES fee_types(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Helpful indexes for student_fees
CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_fee_type_id ON student_fees(fee_type_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_academic_term ON student_fees(academic_term);
CREATE INDEX IF NOT EXISTS idx_student_fees_status ON student_fees(status);
CREATE INDEX IF NOT EXISTS idx_student_fees_due_date ON student_fees(due_date);

-- 9) Create fee_payments table (tracks payment transactions)
CREATE TABLE IF NOT EXISTS fee_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_fee_id INT NOT NULL,
  student_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'bank_transfer', 'online', 'paystack', 'flutterwave') DEFAULT 'cash',
  payment_reference VARCHAR(100) NULL, -- for online payments
  payment_status ENUM('pending', 'successful', 'failed', 'cancelled') DEFAULT 'pending',
  payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_by INT NULL, -- admin/accountant who verified the payment
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fee_payments_student_fee FOREIGN KEY (student_fee_id) REFERENCES student_fees(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_fee_payments_student FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_fee_payments_verified_by FOREIGN KEY (verified_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
);

-- Helpful indexes for fee_payments
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_fee_id ON fee_payments(student_fee_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_id ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_payment_status ON fee_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_fee_payments_payment_date ON fee_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_fee_payments_payment_reference ON fee_payments(payment_reference);

-- 10) Create assignment_submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  content TEXT NULL, -- text submission
  file_url VARCHAR(255) NULL, -- file submission
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('draft', 'submitted', 'graded', 'returned') DEFAULT 'submitted',
  grade VARCHAR(10) NULL, -- grade assigned by teacher
  feedback TEXT NULL, -- teacher feedback
  graded_at DATETIME NULL,
  graded_by INT NULL, -- teacher who graded
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_submissions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_submissions_student FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_submissions_graded_by FOREIGN KEY (graded_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE KEY unique_student_assignment (assignment_id, student_id)
);

-- Helpful indexes for assignment_submissions
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON assignment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON assignment_submissions(submitted_at);