export type BadgeName =
  | "Nivel 1"
  | "Nivel 2"
  | "Nivel 3"
  | "Nivel 4"
  | "Nivel 5"
  | "Nivel 6"
  | "Nivel 7";

export type BadgeLevel = {
  name: BadgeName;
  min: number;
  max: number;
  icon: string;
};

export const USER_POINTS_KEY = "ertzatest_user_points";

export const BADGE_LEVELS: BadgeLevel[] = [
  { name: "Nivel 1", min: 0, max: 49, icon: "/ranks/rank1.png" },
  { name: "Nivel 2", min: 50, max: 99, icon: "/ranks/rank2.png" },
  { name: "Nivel 3", min: 100, max: 249, icon: "/ranks/rank3.png" },
  { name: "Nivel 4", min: 250, max: 499, icon: "/ranks/rank4.png" },
  { name: "Nivel 5", min: 500, max: 749, icon: "/ranks/rank5.png" },
  { name: "Nivel 6", min: 750, max: 999, icon: "/ranks/rank6.png" },
  { name: "Nivel 7", min: 1000, max: Infinity, icon: "/ranks/rank7.png" },
];

export function getBadgeByPoints(points: number): BadgeLevel {
  return (
    BADGE_LEVELS.find(
      (level) => points >= level.min && points <= level.max
    ) ?? BADGE_LEVELS[0]
  );
}

export function getNextBadge(points: number): BadgeLevel | null {
  return BADGE_LEVELS.find((level) => level.min > points) ?? null;
}

export function getProgressToNextBadge(points: number) {
  const current = getBadgeByPoints(points);
  const next = getNextBadge(points);

  if (current && !next) {
    return {
      current,
      next: null,
      progress: 100,
      pointsIntoLevel: points - current.min,
      pointsNeeded: 0,
      currentFloor: current.min,
      currentCeiling: current.max,
    };
  }

  if (current && next) {
    const levelRange = next.min - current.min;
    const pointsIntoLevel = points - current.min;
    const progress = Math.max(
      0,
      Math.min(100, (pointsIntoLevel / levelRange) * 100)
    );

    return {
      current,
      next,
      progress,
      pointsIntoLevel,
      pointsNeeded: next.min - points,
      currentFloor: current.min,
      currentCeiling: next.min,
    };
  }

  return {
    current: BADGE_LEVELS[0],
    next: BADGE_LEVELS[1] ?? null,
    progress: 0,
    pointsIntoLevel: 0,
    pointsNeeded: BADGE_LEVELS[1]?.min ?? 0,
    currentFloor: 0,
    currentCeiling: BADGE_LEVELS[1]?.min ?? 0,
  };
}

export function getAwardedPoints(finalScore: number) {
  if (finalScore >= 30) return 2;
  if (finalScore >= 20) return 1;
  return 0;
}