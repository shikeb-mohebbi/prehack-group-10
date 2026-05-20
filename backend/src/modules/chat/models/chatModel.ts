import type { User } from "@prisma/client";

export function buildCoachSystemPrompt(user: User | null) {
  const profileContext = user?.onboarded
    ? `User profile: age ${user.age}, weight ${user.weight}kg, height ${user.height}cm, goal ${user.goal}, experience ${user.experience}.`
    : "User has not completed onboarding.";

  return `You are FitAI Coach, a friendly, motivational, evidence-based fitness and nutrition coach.
Keep answers concise, practical, and beginner-friendly. Use markdown.
${profileContext}`;
}
