import { gameApi, Question } from "@/lib/api/game";
import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GameState {
    /** The live question queue — 20 questions initially, grows/shrinks seamlessly. */
    questions: Question[];
    /** Index of the currently displayed question within `questions`. */
    currentIndex: number;
    /** Current level being played (used to bias AI question difficulty). */
    level: number;

    /** True while the *initial* batch fetch is in-flight (loading screen gate). */
    isGenerating: boolean;
    /** True while a *background* next-batch fetch is in-flight. */
    isFetchingNext: boolean;
    /** Set when the initial generateBatch call fails. */
    generateError: string | null;

    /** Total questions answered (correct + wrong combined, across the whole session). */
    totalAnswered: number;
    /** Total questions answered correctly across the whole session. */
    totalCorrect: number;

    // ── Actions ───────────────────────────────────────────────────────────────

    /**
     * Fetch the initial 20-question batch.
     * Called from the loading screen before navigation.
     */
    generateBatch: (level: number) => Promise<void>;

    /**
     * Silently fetch the next 20 questions in the background.
     * When ready, trims the last 2 unanswered questions from the end of the
     * queue and appends the new 20. Safe to call multiple times — debounced
     * by the `isFetchingNext` flag.
     */
    fetchNextBatch: () => void;

    /**
     * Record the player's choice for the current question.
     * Returns `true` if the answer was correct.
     *
     * Side-effects:
     *  - Increments `totalAnswered` (always) and `totalCorrect` (if correct).
     *  - Advances `currentIndex`.
     *  - Triggers `fetchNextBatch()` when the player reaches the 2nd-to-last
     *    question in the queue (so new questions arrive before they run out).
     */
    answerQuestion: (choice: string) => boolean;

    /** Reset the entire game state (e.g., when leaving the game screen). */
    reset: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Number of questions ahead of the end at which we pre-fetch. */
const PREFETCH_TRIGGER = 2;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameState>((set, get) => ({
    questions: [],
    currentIndex: 0,
    level: 1,

    isGenerating: false,
    isFetchingNext: false,
    generateError: null,

    totalAnswered: 0,
    totalCorrect: 0,

    // ── generateBatch ─────────────────────────────────────────────────────────

    generateBatch: async (level: number) => {
        set({ isGenerating: true, generateError: null, level, currentIndex: 0, questions: [] });
        try {
            const res = await gameApi.generateQuestions({ level });
            set({ questions: res.data, isGenerating: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to generate questions";
            set({ isGenerating: false, generateError: message });
        }
    },

    // ── fetchNextBatch ────────────────────────────────────────────────────────

    fetchNextBatch: () => {
        // Debounce: do nothing if already fetching
        if (get().isFetchingNext) return;

        set({ isFetchingNext: true });

        const { level, questions, currentIndex } = get();

        // Build list of already-seen questions to pass to the API so it avoids duplicates
        const previousQuestions = questions.map((q) => q.question);

        gameApi
            .generateQuestions({ level, previousQuestions })
            .then((res) => {
                const newBatch = res.data; // always 20 questions

                set((state) => {
                    const current = state.questions;
                    const curIdx = state.currentIndex;

                    // Keep questions up to and including the current index,
                    // then drop the last 2 unanswered (the ones after curIdx + 1),
                    // and append the new 20.
                    //
                    // Concretely:
                    //   answered    = current[0 .. curIdx]  (already done)
                    //   remaining   = current[curIdx+1 ..]  (not yet answered)
                    //   trimmed     = remaining minus its last 2
                    //
                    // We only trim if there are more than 2 remaining, so the
                    // player is never left with zero questions.
                    const answered = current.slice(0, curIdx + 1);
                    const remaining = current.slice(curIdx + 1);
                    const trimmed =
                        remaining.length > 2 ? remaining.slice(0, remaining.length - 2) : remaining;

                    return {
                        questions: [...answered, ...trimmed, ...newBatch],
                        isFetchingNext: false,
                    };
                });
            })
            .catch(() => {
                // Silently swallow the error — player keeps existing questions
                set({ isFetchingNext: false });
            });
    },

    // ── answerQuestion ────────────────────────────────────────────────────────

    answerQuestion: (choice: string): boolean => {
        const { questions, currentIndex } = get();

        const current = questions[currentIndex];
        if (!current) return false;

        const isCorrect = choice === current.correctAnswer;

        set((state) => ({
            totalAnswered: state.totalAnswered + 1,
            totalCorrect: state.totalCorrect + (isCorrect ? 1 : 0),
            currentIndex: state.currentIndex + 1,
        }));

        // Trigger background pre-fetch when we're near the end of the queue
        const nextIndex = currentIndex + 1;
        const queueLength = get().questions.length;
        if (nextIndex >= queueLength - PREFETCH_TRIGGER) {
            get().fetchNextBatch();
        }

        return isCorrect;
    },

    // ── reset ─────────────────────────────────────────────────────────────────

    reset: () =>
        set({
            questions: [],
            currentIndex: 0,
            level: 1,
            isGenerating: false,
            isFetchingNext: false,
            generateError: null,
            totalAnswered: 0,
            totalCorrect: 0,
        }),
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCurrentQuestion = (s: GameState) => s.questions[s.currentIndex] ?? null;
export const selectIsGameReady = (s: GameState) =>
    !s.isGenerating && s.questions.length > 0;
export const selectGameProgress = (s: GameState) => ({
    totalAnswered: s.totalAnswered,
    totalCorrect: s.totalCorrect,
    currentIndex: s.currentIndex,
    queueLength: s.questions.length,
});
