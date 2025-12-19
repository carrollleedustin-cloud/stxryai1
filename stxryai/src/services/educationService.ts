/**
 * Education Service
 * Manages schools, classes, assignments, and student progress
 */

import { createClient } from '@/lib/supabase/client';

export interface School {
  id: string;
  schoolName: string;
  schoolType: 'elementary' | 'middle' | 'high' | 'college' | 'university' | 'other';
  districtName?: string;
  stateProvince?: string;
  country: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
  subscriptionTier: 'trial' | 'basic' | 'premium' | 'enterprise';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  maxStudents: number;
  maxTeachers: number;
  featuresEnabled: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolMembership {
  id: string;
  schoolId: string;
  userId: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'librarian';
  gradeLevel?: string;
  className?: string;
  isActive: boolean;
  enrolledAt: string;
  leftAt?: string;
  permissions: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  schoolId: string;
  teacherId: string;
  className: string;
  subject?: string;
  gradeLevel?: string;
  academicYear?: string;
  semester?: 'fall' | 'spring' | 'summer' | 'full_year';
  isActive: boolean;
  enrollmentCode?: string;
  maxStudents: number;
  curriculumStandards: any[];
  learningObjectives: any[];
  meetingDays: string[];
  meetingTime?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  classId: string;
  createdBy: string;
  title: string;
  description?: string;
  assignmentType: 'reading' | 'writing' | 'discussion' | 'project' | 'quiz' | 'essay';
  storyId?: string;
  chapterId?: string;
  requiredStories: string[];
  requiredChapters: string[];
  wordCountMin?: number;
  wordCountMax?: number;
  readingTimeMinutes?: number;
  assignedDate: string;
  dueDate: string;
  lateSubmissionAllowed: boolean;
  latePenaltyPercentage: number;
  pointsPossible: number;
  gradingRubric: Record<string, any>;
  autoGradeEnabled: boolean;
  isPublished: boolean;
  publishedAt?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionText?: string;
  submissionStoryId?: string;
  attachmentUrls: string[];
  submissionStatus: 'draft' | 'submitted' | 'graded' | 'returned' | 'resubmitted';
  submittedAt?: string;
  isLate: boolean;
  grade?: number;
  pointsEarned?: number;
  feedbackText?: string;
  gradedBy?: string;
  gradedAt?: string;
  autoGradeScore?: number;
  autoGradeFeedback?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export class EducationService {
  private supabase = createClient();

  // ========================================
  // SCHOOLS
  // ========================================

  /**
   * Create a school
   */
  async createSchool(school: Partial<School>): Promise<School> {
    const { data, error } = await this.supabase
      .from('schools')
      .insert({
        school_name: school.schoolName,
        school_type: school.schoolType,
        district_name: school.districtName,
        state_province: school.stateProvince,
        country: school.country || 'US',
        contact_email: school.contactEmail,
        contact_phone: school.contactPhone,
        address: school.address,
        subscription_tier: school.subscriptionTier || 'trial',
        max_students: school.maxStudents || 100,
        max_teachers: school.maxTeachers || 10,
        features_enabled: school.featuresEnabled || {},
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapSchool(data);
  }

  /**
   * Get school by ID
   */
  async getSchool(schoolId: string): Promise<School | null> {
    const { data, error } = await this.supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapSchool(data);
  }

  // ========================================
  // MEMBERSHIPS
  // ========================================

  /**
   * Join a school
   */
  async joinSchool(
    schoolId: string,
    userId: string,
    membership: Partial<SchoolMembership>
  ): Promise<SchoolMembership> {
    const { data, error } = await this.supabase
      .from('school_memberships')
      .insert({
        school_id: schoolId,
        user_id: userId,
        role: membership.role,
        grade_level: membership.gradeLevel,
        class_name: membership.className,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapMembership(data);
  }

  /**
   * Get user's school memberships
   */
  async getUserMemberships(userId: string): Promise<SchoolMembership[]> {
    const { data, error } = await this.supabase
      .from('school_memberships')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return (data || []).map((item: any) => this.mapMembership(item));
  }

  // ========================================
  // CLASSES
  // ========================================

  /**
   * Create a class
   */
  async createClass(
    schoolId: string,
    teacherId: string,
    classData: Partial<Class>
  ): Promise<Class> {
    const { data, error } = await this.supabase
      .from('classes')
      .insert({
        school_id: schoolId,
        teacher_id: teacherId,
        class_name: classData.className,
        subject: classData.subject,
        grade_level: classData.gradeLevel,
        academic_year: classData.academicYear,
        semester: classData.semester,
        max_students: classData.maxStudents || 30,
        curriculum_standards: classData.curriculumStandards || [],
        learning_objectives: classData.learningObjectives || [],
        meeting_days: classData.meetingDays || [],
        meeting_time: classData.meetingTime,
        enrollment_code: this.generateEnrollmentCode(),
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapClass(data);
  }

  /**
   * Get teacher's classes
   */
  async getTeacherClasses(teacherId: string): Promise<Class[]> {
    const { data, error } = await this.supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapClass(item));
  }

  /**
   * Join a class by enrollment code
   */
  async joinClassByCode(
    enrollmentCode: string,
    studentId: string
  ): Promise<Class> {
    const { data: classData, error: classError } = await this.supabase
      .from('classes')
      .select('*')
      .eq('enrollment_code', enrollmentCode)
      .eq('is_active', true)
      .single();

    if (classError) throw classError;
    if (!classData) throw new Error('Class not found');

    // Enroll student
    const { error: enrollError } = await this.supabase
      .from('class_enrollments')
      .insert({
        class_id: classData.id,
        student_id: studentId,
        enrollment_status: 'enrolled',
      });

    if (enrollError) throw enrollError;

    return this.mapClass(classData);
  }

  // ========================================
  // ASSIGNMENTS
  // ========================================

  /**
   * Create an assignment
   */
  async createAssignment(
    classId: string,
    createdBy: string,
    assignment: Partial<Assignment>
  ): Promise<Assignment> {
    const { data, error } = await this.supabase
      .from('assignments')
      .insert({
        class_id: classId,
        created_by: createdBy,
        title: assignment.title,
        description: assignment.description,
        assignment_type: assignment.assignmentType,
        story_id: assignment.storyId,
        chapter_id: assignment.chapterId,
        required_stories: assignment.requiredStories || [],
        required_chapters: assignment.requiredChapters || [],
        word_count_min: assignment.wordCountMin,
        word_count_max: assignment.wordCountMax,
        reading_time_minutes: assignment.readingTimeMinutes,
        assigned_date: assignment.assignedDate,
        due_date: assignment.dueDate,
        late_submission_allowed: assignment.lateSubmissionAllowed,
        late_penalty_percentage: assignment.latePenaltyPercentage || 0,
        points_possible: assignment.pointsPossible || 100,
        grading_rubric: assignment.gradingRubric || {},
        auto_grade_enabled: assignment.autoGradeEnabled,
        is_published: assignment.isPublished || false,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapAssignment(data);
  }

  /**
   * Get assignments for a class
   */
  async getClassAssignments(classId: string): Promise<Assignment[]> {
    const { data, error } = await this.supabase
      .from('assignments')
      .select('*')
      .eq('class_id', classId)
      .eq('is_published', true)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapAssignment(item));
  }

  // ========================================
  // SUBMISSIONS
  // ========================================

  /**
   * Submit an assignment
   */
  async submitAssignment(
    assignmentId: string,
    studentId: string,
    submission: Partial<AssignmentSubmission>
  ): Promise<AssignmentSubmission> {
    const assignment = await this.getAssignment(assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    const isLate = new Date() > new Date(assignment.dueDate);

    const { data, error } = await this.supabase
      .from('assignment_submissions')
      .upsert({
        assignment_id: assignmentId,
        student_id: studentId,
        submission_text: submission.submissionText,
        submission_story_id: submission.submissionStoryId,
        attachment_urls: submission.attachmentUrls || [],
        submission_status: 'submitted',
        submitted_at: new Date().toISOString(),
        is_late: isLate,
      }, {
        onConflict: 'assignment_id,student_id',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapSubmission(data);
  }

  /**
   * Get assignment
   */
  async getAssignment(assignmentId: string): Promise<Assignment | null> {
    const { data, error } = await this.supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapAssignment(data);
  }

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  private generateEnrollmentCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // ========================================
  // MAPPING FUNCTIONS
  // ========================================

  private mapSchool(data: any): School {
    return {
      id: data.id,
      schoolName: data.school_name,
      schoolType: data.school_type,
      districtName: data.district_name,
      stateProvince: data.state_province,
      country: data.country,
      contactEmail: data.contact_email,
      contactPhone: data.contact_phone,
      address: data.address,
      isActive: data.is_active,
      subscriptionTier: data.subscription_tier,
      subscriptionStartDate: data.subscription_start_date,
      subscriptionEndDate: data.subscription_end_date,
      maxStudents: data.max_students,
      maxTeachers: data.max_teachers,
      featuresEnabled: data.features_enabled || {},
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapMembership(data: any): SchoolMembership {
    return {
      id: data.id,
      schoolId: data.school_id,
      userId: data.user_id,
      role: data.role,
      gradeLevel: data.grade_level,
      className: data.class_name,
      isActive: data.is_active,
      enrolledAt: data.enrolled_at,
      leftAt: data.left_at,
      permissions: data.permissions || {},
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapClass(data: any): Class {
    return {
      id: data.id,
      schoolId: data.school_id,
      teacherId: data.teacher_id,
      className: data.class_name,
      subject: data.subject,
      gradeLevel: data.grade_level,
      academicYear: data.academic_year,
      semester: data.semester,
      isActive: data.is_active,
      enrollmentCode: data.enrollment_code,
      maxStudents: data.max_students,
      curriculumStandards: data.curriculum_standards || [],
      learningObjectives: data.learning_objectives || [],
      meetingDays: data.meeting_days || [],
      meetingTime: data.meeting_time,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapAssignment(data: any): Assignment {
    return {
      id: data.id,
      classId: data.class_id,
      createdBy: data.created_by,
      title: data.title,
      description: data.description,
      assignmentType: data.assignment_type,
      storyId: data.story_id,
      chapterId: data.chapter_id,
      requiredStories: data.required_stories || [],
      requiredChapters: data.required_chapters || [],
      wordCountMin: data.word_count_min,
      wordCountMax: data.word_count_max,
      readingTimeMinutes: data.reading_time_minutes,
      assignedDate: data.assigned_date,
      dueDate: data.due_date,
      lateSubmissionAllowed: data.late_submission_allowed,
      latePenaltyPercentage: parseFloat(data.late_penalty_percentage || '0'),
      pointsPossible: parseFloat(data.points_possible || '100'),
      gradingRubric: data.grading_rubric || {},
      autoGradeEnabled: data.auto_grade_enabled,
      isPublished: data.is_published,
      publishedAt: data.published_at,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapSubmission(data: any): AssignmentSubmission {
    return {
      id: data.id,
      assignmentId: data.assignment_id,
      studentId: data.student_id,
      submissionText: data.submission_text,
      submissionStoryId: data.submission_story_id,
      attachmentUrls: data.attachment_urls || [],
      submissionStatus: data.submission_status,
      submittedAt: data.submitted_at,
      isLate: data.is_late,
      grade: data.grade ? parseFloat(data.grade) : undefined,
      pointsEarned: data.points_earned ? parseFloat(data.points_earned) : undefined,
      feedbackText: data.feedback_text,
      gradedBy: data.graded_by,
      gradedAt: data.graded_at,
      autoGradeScore: data.auto_grade_score ? parseFloat(data.auto_grade_score) : undefined,
      autoGradeFeedback: data.auto_grade_feedback,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const educationService = new EducationService();

