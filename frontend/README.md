# Duolingo Clone – Frontend

Next.js 16 (App Router) + TypeScript + Tailwind CSS frontend for the Duolingo clone assignment.

## Getting Started

The backend must be running first (see the repo root `README.md`).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend proxies `/api/*` to the FastAPI backend via the rewrite in `next.config.ts`, so no extra config is needed locally.

## Commands

- `npm run dev` – development server
- `npm run build` – production build
- `npm run lint` – ESLint check
- `npm run start` – serve the production build

## Structure

- `app/(main)/` – pages with the sidebar layout: `learn/` (learning-path road), `profile/`, `leaderboard/`, `settings/`, landing `page.tsx`
- `app/lesson/[lessonId]/` – the lesson player page (own layout, no sidebar)
- `components/lesson/` – `ExerciseRenderer` plus per-type renderers (`MultipleChoice`, `WordBank`, `MatchPairs`, `FillBlank`, `TypeAnswer`) and `types.ts`
- `components/layout/` – `Sidebar`, `TopBar`
- `components/ui/` – `Modal`, `Toast`, `Confetti`
- `hooks/` – `useLesson.ts`, `useUserProgress.ts`
- `lib/` – `api.ts` (API client), `types.ts` (types + `XP_VALUES`), `sounds.ts` (procedural Web Audio correct/wrong sound effects)

API response shapes mirror the types in `lib/types.ts`.
