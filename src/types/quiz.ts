export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correct_option: number;
    explanation?: string;
    points: number;
    category?: string;
}

export interface QuizAttempt {
    id: string;
    user_id: string;
    score: number;
    xp_awarded: number;
    created_at: string;
}

export interface SubmissionQuizQuestion {
    id: string;
    question: string;
    options: string[];
    correct_option: number; // 0-3
}

export type SubmissionQuiz = SubmissionQuizQuestion[];
