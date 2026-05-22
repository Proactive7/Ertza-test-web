export type OptionKey = "a" | "b" | "c" | "d";

export type ViewMode =
  | "home"
  | "topics"
  | "quiz"
  | "panel"
  | "insignias"
  | "test_review"
  | "legal_terms"
  | "legal_privacy"
  | "legal_cookies";

export type TopicKey =
  | "constitucion"
  | "derechopenal"
  | "historia"
  | "igualdad"
  | "trafico"
  | "simulacro";

export type Question = {
  id: number;
  pregunta: string;
  a: string;
  b: string;
  c: string;
  d: string;
  correcta: OptionKey;
};

export type Topic = {
  key: Exclude<TopicKey, "simulacro">;
  title: string;
  description: string;
  badge: string;
};

export type TestAttempt = {
  id: string;
  user_id: string;
  topic_key: TopicKey;
  topic_name: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  blank_answers: number;
  total_questions: number;
  passed: boolean;
  points_earned: number;
  time_spent_seconds: number | null;
  time_remaining_seconds: number | null;
  created_at: string;
};

export type TestAttemptAnswer = {
  id: string;
  attempt_id: string;
  user_id: string;
  question_id: string;
  topic_key: TopicKey;
  topic_name: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  selected_option: OptionKey | null;
  correct_option: OptionKey;
  is_correct: boolean;
  is_blank: boolean;
  created_at: string;
};
