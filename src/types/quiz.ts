export interface QuizOption {
    text: string;
    isCorrect: boolean;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: QuizOption[];
    explanation?: string;
    points: number;
}

export interface QuizAttempt {
    id: string;
    user_id: string;
    score: number;
    xp_awarded: number;
    created_at: string;
}
