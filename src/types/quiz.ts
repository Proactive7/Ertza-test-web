export type OptionKey = "a" | "b" | "c" | "d";

export type ViewMode =
  | "home"
  | "topics"
  | "quiz"
  | "panel"
  | "insignias"
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