import { Question, TopicKey } from "@/types/quiz";

import { constitucionQuestions } from "./questionBank/constitucion";
import { derechoPenalQuestions } from "./questionBank/derechopenal";
import { historiaQuestions } from "./questionBank/historia";
import { igualdadQuestions } from "./questionBank/igualdad";
import { traficoQuestions } from "./questionBank/trafico";

const simulacroQuestions: Question[] = [
  ...constitucionQuestions,
  ...derechoPenalQuestions,
  ...historiaQuestions,
  ...igualdadQuestions,
  ...traficoQuestions,
];

export const QUESTIONS_DB: Record<TopicKey, Question[]> = {
  constitucion: constitucionQuestions,
  derechopenal: derechoPenalQuestions,
  historia: historiaQuestions,
  igualdad: igualdadQuestions,
  trafico: traficoQuestions,
  simulacro: simulacroQuestions,
};