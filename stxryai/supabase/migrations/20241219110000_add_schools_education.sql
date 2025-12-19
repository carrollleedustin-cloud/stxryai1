-- Location: supabase/migrations/20241219110000_add_schools_education.sql
-- Schema Analysis: Existing stories, chapters, user_profiles
-- Integration Type: Extension - Adding education/school features
-- Dependencies: stories, chapters, user_profiles, auth.users

-- ========================================
-- 1. SCHOOLS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- School details
    school_name TEXT NOT NULL,
    school_type TEXT NOT NULL CHECK (school_type IN ('elementary', 'middle', 'high', 'college', 'university', 'other')),
    district_name TEXT,
    state_province TEXT,
    country TEXT DEFAULT 'US',
    
    -- Contact information
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    
    -- School settings
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    subscription_tier TEXT DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'basic', 'premium', 'enterprise')),
    subscription_start_date DATE,
    subscription_end_date DATE,
    max_students INTEGER DEFAULT 100,
    max_teachers INTEGER DEFAULT 10,
    
    -- Features
    features_enabled JSONB DEFAULT '{}' NOT NULL, -- Array of enabled features
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 2. SCHOOL MEMBERSHIPS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.school_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Membership details
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent', 'librarian')),
    grade_level TEXT, -- For students: '1', '2', '3', etc. or 'K', 'PK'
    class_name TEXT, -- e.g., 'Mrs. Smith - 3rd Grade'
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    enrolled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    left_at TIMESTAMPTZ,
    
    -- Permissions
    permissions JSONB DEFAULT '{}' NOT NULL, -- Custom permissions
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(school_id, user_id)
);

-- ========================================
-- 3. CLASSES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Class details
    class_name TEXT NOT NULL,
    subject TEXT, -- e.g., 'English', 'Reading', 'Language Arts'
    grade_level TEXT,
    academic_year TEXT, -- e.g., '2024-2025'
    semester TEXT, -- 'fall', 'spring', 'summer', 'full_year'
    
    -- Class settings
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    enrollment_code TEXT UNIQUE, -- Code for students to join
    max_students INTEGER DEFAULT 30,
    
    -- Curriculum
    curriculum_standards JSONB DEFAULT '[]' NOT NULL, -- Common Core, state standards, etc.
    learning_objectives JSONB DEFAULT '[]' NOT NULL,
    
    -- Schedule
    meeting_days TEXT[] DEFAULT '{}', -- ['monday', 'wednesday', 'friday']
    meeting_time TEXT, -- e.g., '9:00 AM - 10:00 AM'
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 4. CLASS ENROLLMENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.class_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Enrollment details
    enrollment_status TEXT DEFAULT 'enrolled' NOT NULL CHECK (enrollment_status IN ('enrolled', 'dropped', 'completed')),
    enrolled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMPTZ,
    
    -- Student progress
    stories_completed INTEGER DEFAULT 0 NOT NULL,
    chapters_read INTEGER DEFAULT 0 NOT NULL,
    reading_time_minutes INTEGER DEFAULT 0 NOT NULL,
    assignments_completed INTEGER DEFAULT 0 NOT NULL,
    
    -- Grades/Performance
    overall_grade DECIMAL(5, 2), -- Percentage or letter grade
    participation_score DECIMAL(3, 2) DEFAULT 0 CHECK (participation_score >= 0 AND participation_score <= 1),
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(class_id, student_id)
);

-- ========================================
-- 5. ASSIGNMENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Assignment details
    title TEXT NOT NULL,
    description TEXT,
    assignment_type TEXT NOT NULL CHECK (assignment_type IN ('reading', 'writing', 'discussion', 'project', 'quiz', 'essay')),
    
    -- Related content
    story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    
    -- Requirements
    required_stories UUID[] DEFAULT '{}',
    required_chapters UUID[] DEFAULT '{}',
    word_count_min INTEGER,
    word_count_max INTEGER,
    reading_time_minutes INTEGER,
    
    -- Due dates
    assigned_date DATE NOT NULL,
    due_date DATE NOT NULL,
    late_submission_allowed BOOLEAN DEFAULT FALSE NOT NULL,
    late_penalty_percentage DECIMAL(5, 2) DEFAULT 0,
    
    -- Grading
    points_possible DECIMAL(10, 2) DEFAULT 100,
    grading_rubric JSONB DEFAULT '{}' NOT NULL,
    auto_grade_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Status
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    published_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 6. ASSIGNMENT SUBMISSIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Submission content
    submission_text TEXT,
    submission_story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    attachment_urls TEXT[] DEFAULT '{}',
    
    -- Status
    submission_status TEXT DEFAULT 'draft' NOT NULL CHECK (submission_status IN ('draft', 'submitted', 'graded', 'returned', 'resubmitted')),
    submitted_at TIMESTAMPTZ,
    is_late BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Grading
    grade DECIMAL(10, 2),
    points_earned DECIMAL(10, 2),
    feedback_text TEXT,
    graded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    graded_at TIMESTAMPTZ,
    
    -- Auto-grading results
    auto_grade_score DECIMAL(10, 2),
    auto_grade_feedback TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(assignment_id, student_id)
);

-- ========================================
-- 7. STUDENT READING PROGRESS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.student_reading_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    
    -- Progress tracking
    progress_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent_minutes INTEGER DEFAULT 0 NOT NULL,
    last_read_at TIMESTAMPTZ,
    
    -- Reading metrics
    words_read INTEGER DEFAULT 0,
    reading_speed_wpm INTEGER, -- Words per minute
    comprehension_score DECIMAL(3, 2) CHECK (comprehension_score >= 0 AND comprehension_score <= 1),
    
    -- Assignment context
    is_assignment_reading BOOLEAN DEFAULT FALSE NOT NULL,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 8. TEACHER DASHBOARD ANALYTICS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.teacher_dashboard_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    
    -- Time period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Class metrics
    total_students INTEGER DEFAULT 0,
    active_students INTEGER DEFAULT 0,
    average_reading_time_minutes DECIMAL(10, 2) DEFAULT 0,
    average_completion_rate DECIMAL(5, 2) DEFAULT 0,
    average_grade DECIMAL(5, 2) DEFAULT 0,
    
    -- Assignment metrics
    assignments_created INTEGER DEFAULT 0,
    assignments_completed INTEGER DEFAULT 0,
    average_submission_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Engagement metrics
    total_stories_read INTEGER DEFAULT 0,
    total_chapters_read INTEGER DEFAULT 0,
    discussion_participation_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Performance insights
    struggling_students UUID[] DEFAULT '{}',
    top_performers UUID[] DEFAULT '{}',
    improvement_areas JSONB DEFAULT '{}' NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 9. CURRICULUM STANDARDS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.curriculum_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Standard details
    standard_code TEXT NOT NULL UNIQUE, -- e.g., 'CCSS.ELA-LITERACY.RL.3.1'
    standard_name TEXT NOT NULL,
    standard_description TEXT,
    
    -- Standard classification
    framework TEXT NOT NULL CHECK (framework IN ('common_core', 'state', 'international', 'custom')),
    subject TEXT NOT NULL, -- 'english', 'reading', 'writing', 'language_arts'
    grade_level TEXT NOT NULL,
    domain TEXT, -- 'reading_literature', 'reading_informational', 'writing', etc.
    
    -- Alignment
    aligned_stories UUID[] DEFAULT '{}',
    aligned_assignments UUID[] DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 10. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_schools_active ON public.schools(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_schools_subscription ON public.schools(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_school_memberships_school ON public.school_memberships(school_id);
CREATE INDEX IF NOT EXISTS idx_school_memberships_user ON public.school_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_school_memberships_role ON public.school_memberships(role);
CREATE INDEX IF NOT EXISTS idx_school_memberships_active ON public.school_memberships(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_classes_school ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_active ON public.classes(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_class_enrollments_class ON public.class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student ON public.class_enrollments(student_id);

CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_story ON public.assignments(story_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_published ON public.assignments(is_published) WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON public.assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON public.assignment_submissions(submission_status);

CREATE INDEX IF NOT EXISTS idx_student_reading_progress_student ON public.student_reading_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_reading_progress_class ON public.student_reading_progress(class_id);
CREATE INDEX IF NOT EXISTS idx_student_reading_progress_story ON public.student_reading_progress(story_id);

CREATE INDEX IF NOT EXISTS idx_teacher_dashboard_analytics_teacher ON public.teacher_dashboard_analytics(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_dashboard_analytics_class ON public.teacher_dashboard_analytics(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_dashboard_analytics_period ON public.teacher_dashboard_analytics(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_curriculum_standards_framework ON public.curriculum_standards(framework);
CREATE INDEX IF NOT EXISTS idx_curriculum_standards_subject ON public.curriculum_standards(subject);
CREATE INDEX IF NOT EXISTS idx_curriculum_standards_grade ON public.curriculum_standards(grade_level);

-- ========================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_dashboard_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_standards ENABLE ROW LEVEL SECURITY;

-- Schools Policies
CREATE POLICY "School admins can manage their school"
    ON public.schools FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.school_memberships
            WHERE school_memberships.school_id = schools.id
            AND school_memberships.user_id = auth.uid()
            AND school_memberships.role = 'admin'
        )
    );

-- School Memberships Policies
CREATE POLICY "Users can view their own memberships"
    ON public.school_memberships FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "School admins can view all memberships"
    ON public.school_memberships FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.school_memberships sm
            WHERE sm.school_id = school_memberships.school_id
            AND sm.user_id = auth.uid()
            AND sm.role = 'admin'
        )
    );

-- Classes Policies
CREATE POLICY "Teachers can manage their classes"
    ON public.classes FOR ALL
    USING (auth.uid() = teacher_id)
    WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Students can view their classes"
    ON public.classes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.class_enrollments
            WHERE class_enrollments.class_id = classes.id
            AND class_enrollments.student_id = auth.uid()
        )
    );

-- Class Enrollments Policies
CREATE POLICY "Students can view their own enrollments"
    ON public.class_enrollments FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view enrollments in their classes"
    ON public.class_enrollments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.classes
            WHERE classes.id = class_enrollments.class_id
            AND classes.teacher_id = auth.uid()
        )
    );

-- Assignments Policies
CREATE POLICY "Teachers can manage assignments in their classes"
    ON public.assignments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.classes
            WHERE classes.id = assignments.class_id
            AND classes.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can view assignments in their classes"
    ON public.assignments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.class_enrollments
            WHERE class_enrollments.class_id = assignments.class_id
            AND class_enrollments.student_id = auth.uid()
        )
    );

-- Assignment Submissions Policies
CREATE POLICY "Students can manage their own submissions"
    ON public.assignment_submissions FOR ALL
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view submissions in their classes"
    ON public.assignment_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.assignments
            JOIN public.classes ON classes.id = assignments.class_id
            WHERE assignments.id = assignment_submissions.assignment_id
            AND classes.teacher_id = auth.uid()
        )
    );

-- Student Reading Progress Policies
CREATE POLICY "Students can view their own progress"
    ON public.student_reading_progress FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view progress in their classes"
    ON public.student_reading_progress FOR SELECT
    USING (
        class_id IS NULL OR EXISTS (
            SELECT 1 FROM public.classes
            WHERE classes.id = student_reading_progress.class_id
            AND classes.teacher_id = auth.uid()
        )
    );

-- Teacher Dashboard Analytics Policies
CREATE POLICY "Teachers can view their own analytics"
    ON public.teacher_dashboard_analytics FOR SELECT
    USING (auth.uid() = teacher_id);

-- Curriculum Standards Policies
CREATE POLICY "Anyone can view curriculum standards"
    ON public.curriculum_standards FOR SELECT
    USING (true);

-- ========================================
-- 12. FUNCTIONS AND TRIGGERS
-- ========================================

-- Triggers for updated_at
CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON public.schools
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_memberships_updated_at
    BEFORE UPDATE ON public.school_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_class_enrollments_updated_at
    BEFORE UPDATE ON public.class_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignment_submissions_updated_at
    BEFORE UPDATE ON public.assignment_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_reading_progress_updated_at
    BEFORE UPDATE ON public.student_reading_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teacher_dashboard_analytics_updated_at
    BEFORE UPDATE ON public.teacher_dashboard_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_curriculum_standards_updated_at
    BEFORE UPDATE ON public.curriculum_standards
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update class enrollment statistics
CREATE OR REPLACE FUNCTION public.update_class_enrollment_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.classes
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.class_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_class_enrollment_stats_trigger
    AFTER INSERT OR UPDATE ON public.class_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_class_enrollment_stats();

-- ========================================
-- 13. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.schools IS 'Educational institutions using the platform';
COMMENT ON TABLE public.school_memberships IS 'User memberships in schools';
COMMENT ON TABLE public.classes IS 'Classrooms within schools';
COMMENT ON TABLE public.class_enrollments IS 'Student enrollments in classes';
COMMENT ON TABLE public.assignments IS 'Assignments created by teachers';
COMMENT ON TABLE public.assignment_submissions IS 'Student submissions for assignments';
COMMENT ON TABLE public.student_reading_progress IS 'Reading progress tracking for students';
COMMENT ON TABLE public.teacher_dashboard_analytics IS 'Analytics data for teacher dashboards';
COMMENT ON TABLE public.curriculum_standards IS 'Curriculum standards (Common Core, state, etc.)';

COMMENT ON COLUMN public.schools.subscription_tier IS 'School subscription level (trial, basic, premium, enterprise)';
COMMENT ON COLUMN public.school_memberships.role IS 'User role in school (admin, teacher, student, parent, librarian)';
COMMENT ON COLUMN public.assignments.assignment_type IS 'Type of assignment (reading, writing, discussion, project, quiz, essay)';
COMMENT ON COLUMN public.curriculum_standards.framework IS 'Standard framework (common_core, state, international, custom)';

