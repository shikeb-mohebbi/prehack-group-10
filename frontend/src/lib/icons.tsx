import {
  Dumbbell,
  HeartPulse,
  Bike,
  Activity,
  Footprints,
  Hand,
  Flame,
  Sunrise,
  Utensils,
  Soup,
  Apple,
  type LucideIcon,
} from "lucide-react";

export function exerciseIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (/(push|chest|bench|shoulder|press|dip|fly)/.test(n)) return Dumbbell;
  if (/(pull|row|back|lat|chin|deadlift|curl|bicep|grip)/.test(n)) return Hand;
  if (/(squat|lunge|leg|calf|glute|hip|step|kick)/.test(n)) return Footprints;
  if (/(core|ab|plank|crunch|sit[- ]?up|twist|russian)/.test(n)) return Activity;
  if (/(run|jog|cardio|cycle|bike|spin|row machine|jump|burpee|hiit|sprint|treadmill)/.test(n))
    return /(bike|cycle|spin)/.test(n) ? Bike : HeartPulse;
  return Flame;
}

export function mealIcon(section: string): LucideIcon {
  const s = section.toLowerCase();
  if (s.includes("break")) return Sunrise;
  if (s.includes("lunch")) return Utensils;
  if (s.includes("dinner")) return Soup;
  if (s.includes("snack")) return Apple;
  return Utensils;
}
