import { supabase } from "@/lib/supabaseClient";
import { OptionKey, Question } from "@/types/quiz";

export type StoredAnswerRecord = {
  question: Question;
  selectedOption: OptionKey | null;
  correctOption: OptionKey;
  isCorrect: boolean;
};

export type StoredTestResult = {
  id: string;
  topicKey: string;
  topicName: string;
  dateISO: string;
  score: number;
  correct: number;
  incorrect: number;
  blank: number;
  answered: number;
  totalQuestions: number;
  pointsEarned: number;
  timeRemainingSeconds: number;
  timeSpentSeconds: number;
  answers?: StoredAnswerRecord[];
};

export async function saveTestResult(
  result: StoredTestResult
): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("No hay usuario logueado para guardar el resultado.");
    return;
  }

  const { error } = await supabase.rpc("submit_test_result", {
    p_topic_key: result.topicKey,
    p_topic_name: result.topicName,
    p_score: result.score,
    p_correct_answers: result.correct,
    p_wrong_answers: result.incorrect,
    p_blank_answers: result.blank,
  });

  if (error) {
    console.error("Error guardando resultado en Supabase:", error.message);
    return;
  }

  if (!result.answers?.length) {
    return;
  }

  const { data: attempt, error: attemptError } = await supabase
    .from("test_attempts")
    .insert({
      user_id: user.id,
      topic_key: result.topicKey,
      topic_name: result.topicName,
      score: result.score,
      correct_answers: result.correct,
      wrong_answers: result.incorrect,
      blank_answers: result.blank,
      total_questions: result.totalQuestions,
      passed: result.score >= 20,
      points_earned: result.pointsEarned,
      time_spent_seconds: result.timeSpentSeconds,
      time_remaining_seconds: result.timeRemainingSeconds,
      created_at: result.dateISO,
    })
    .select("id")
    .single();

  if (attemptError || !attempt?.id) {
    console.error(
      "Error guardando intento detallado:",
      attemptError?.message || "No se pudo crear el intento."
    );
    return;
  }

  const answerRows = result.answers.map((answer) => ({
    attempt_id: attempt.id,
    user_id: user.id,
    question_id: String(answer.question.id),
    topic_key: result.topicKey,
    topic_name: result.topicName,
    question_text: answer.question.pregunta,
    option_a: answer.question.a,
    option_b: answer.question.b,
    option_c: answer.question.c,
    option_d: answer.question.d,
    selected_option: answer.selectedOption,
    correct_option: answer.correctOption,
    is_correct: answer.isCorrect,
    is_blank: answer.selectedOption === null,
    created_at: result.dateISO,
  }));

  const { error: answersError } = await supabase
    .from("test_attempt_answers")
    .insert(answerRows);

  if (answersError) {
    console.error(
      "Error guardando respuestas detalladas:",
      answersError.message
    );
  }
}

export function getAverageScore(results: StoredTestResult[]): number {
  if (!results.length) return 0;
  const total = results.reduce((sum, item) => sum + item.score, 0);
  return total / results.length;
}

export function getApprovedTestsCount(results: StoredTestResult[]): number {
  return results.filter((item) => item.score >= 20).length;
}

export function getRecentResults(
  results: StoredTestResult[],
  limit = 5
): StoredTestResult[] {
  return [...results]
    .sort(
      (a, b) =>
        new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
    )
    .slice(0, limit);
}

export function getBestScore(results: StoredTestResult[]): number {
  if (!results.length) return 0;
  return Math.max(...results.map((item) => item.score));
}

export function getMostPlayedTopic(results: StoredTestResult[]): string {
  if (!results.length) return "Sin datos";

  const counts = new Map<string, number>();

  for (const result of results) {
    counts.set(result.topicName, (counts.get(result.topicName) ?? 0) + 1);
  }

  let winner = "Sin datos";
  let max = 0;

  for (const [topic, count] of counts.entries()) {
    if (count > max) {
      max = count;
      winner = topic;
    }
  }

  return winner;
}

function toDayKey(dateISO: string): string {
  const date = new Date(dateISO);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentStreak(results: StoredTestResult[]): number {
  if (!results.length) return 0;

  const uniqueDays = Array.from(
    new Set(results.map((item) => toDayKey(item.dateISO)))
  ).sort((a, b) => (a < b ? 1 : -1));

  if (!uniqueDays.length) return 0;

  let streak = 1;
  let previousDate = new Date(`${uniqueDays[0]}T00:00:00`);

  for (let i = 1; i < uniqueDays.length; i += 1) {
    const currentDate = new Date(`${uniqueDays[i]}T00:00:00`);
    const diffMs = previousDate.getTime() - currentDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak += 1;
      previousDate = currentDate;
    } else {
      break;
    }
  }

  return streak;
}
