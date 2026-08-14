"use client";

import type { Exercise } from "@/lib/types";
import type { ExerciseProps } from "./types";
import MultipleChoice from "./MultipleChoice";
import WordBank from "./WordBank";
import MatchPairs from "./MatchPairs";
import FillBlank from "./FillBlank";
import TypeAnswer from "./TypeAnswer";

/**
 * Renders an exercise by type. Every renderer collects the user's answer
 * into the shared `value` string via `onChange`.
 */
export default function ExerciseRenderer(props: ExerciseProps) {
  const { exercise } = props;
  switch (exercise.type) {
    case "multiple_choice":
      return <MultipleChoice {...props} />;
    case "word_bank":
      return <WordBank {...props} />;
    case "match_pairs":
      return <MatchPairs {...props} />;
    case "fill_blank":
      return <FillBlank {...props} />;
    case "type_answer":
      return <TypeAnswer {...props} />;
    default:
      return null;
  }
}

export type { ExerciseProps };
export type { Exercise };