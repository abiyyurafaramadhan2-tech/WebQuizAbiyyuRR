<?php

namespace App\Http\Controllers;

use App\Models\QuizSession;
use App\Models\Leaderboard;
use App\Services\AiQuestionService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function __construct(
        private AiQuestionService $aiService
    ) {}

    // ─── Dashboard ─────────────────────────────

    public function dashboard()
    {
        $user = Auth::user();

        $recentSessions = QuizSession::where('user_id', $user->id)
            ->where('status', 'completed')
            ->latest('completed_at')
            ->take(5)
            ->get(['id', 'grade', 'subject', 'score', 'correct_answers', 'completed_at']);

        $globalRank = Leaderboard::where('score', '>', $user->total_score)->count() + 1;

        return Inertia::render('Dashboard', [
            'user' => [
                'name'               => $user->name,
                'avatar_emoji'       => $user->avatar_emoji,
                'avatar_color'       => $user->avatar_color,
                'grade'              => $user->grade,
                'preferred_language' => $user->preferred_language,
                'total_score'        => $user->total_score,
                'total_sessions'     => $user->total_sessions,
                'best_streak'        => $user->best_streak,
                'global_rank'        => $globalRank,
            ],
            'recentSessions' => $recentSessions,
        ]);
    }

    // ─── Start Quiz ────────────────────────────

    public function start(Request $request)
    {
        $validated = $request->validate([
            'grade'    => 'required|string',
            'subject'  => 'required|string',
            'language' => 'required|in:id,en',
            'mode'     => 'required|in:learning,exam',
        ]);

        $user = Auth::user();

        try {
            $questions = $this->aiService->generateQuestions(
                grade:     $validated['grade'],
                subject:   $validated['subject'],
                language:  $validated['language'],
                difficulty: 1,
                count:     (int) config('quiz.questions_per_session', 10),
                userId:    $user->id
            );
        } catch (\Throwable $e) {
            return back()->withErrors([
                'ai' => 'Gagal membuat soal. Cek API Key kamu di file .env. Error: ' . $e->getMessage()
            ]);
        }

        $session = QuizSession::create([
            'user_id'       => $user->id,
            'session_token' => Str::random(32),
            'grade'         => $validated['grade'],
            'subject'       => $validated['subject'],
            'language'      => $validated['language'],
            'mode'          => $validated['mode'],
            'difficulty'    => 1,
            'questions'     => $questions,
            'answers_log'   => [],
        ]);

        return redirect()->route('quiz.arena', $session->session_token);
    }

    // ─── Arena ─────────────────────────────────

    public function arena(string $token)
    {
        $session = QuizSession::where('session_token', $token)
            ->where('user_id', Auth::id())
            ->where('status', 'active')
            ->firstOrFail();

        return Inertia::render('QuizArena', [
            'session' => [
                'id'               => $session->id,
                'session_token'    => $session->session_token,
                'grade'            => $session->grade,
                'subject'          => $session->subject,
                'language'         => $session->language,
                'mode'             => $session->mode,
                'difficulty'       => $session->difficulty,
                'current_question' => $session->current_question,
                'score'            => $session->score,
                'streak'           => $session->streak,
                'questions'        => $session->questions,
            ],
            'config' => [
                'timePerQuestion' => (int) config('quiz.time_per_question', 30),
                'streakThreshold' => (int) config('quiz.streak_threshold', 3),
                'totalQuestions'  => count($session->questions),
            ],
        ]);
    }

    // ─── Answer ────────────────────────────────

    public function answer(Request $request, string $token)
    {
        $validated = $request->validate([
            'question_index' => 'required|integer|min:0',
            'answer'         => 'required|in:A,B,C,D',
            'time_taken'     => 'required|integer|min:0|max:60',
        ]);

        $session = QuizSession::where('session_token', $token)
            ->where('user_id', Auth::id())
            ->where('status', 'active')
            ->firstOrFail();

        $questions = $session->questions;
        $qIndex    = $validated['question_index'];
        $answer    = $validated['answer'];

        if (!isset($questions[$qIndex]) || $questions[$qIndex]['answered'] !== null) {
            return response()->json(['error' => 'Soal tidak valid'], 422);
        }

        $question  = $questions[$qIndex];
        $isCorrect = ($answer === $question['correct']);
        $timeTaken = $validated['time_taken'];

        // Hitung poin
        $basePoints  = $isCorrect ? 100 : 0;
        $timeBonus   = $isCorrect ? max(0, (30 - $timeTaken) * 2) : 0;
        $streakBonus = ($isCorrect && $session->streak >= 2) ? 50 : 0;
        $totalPoints = $basePoints + $timeBonus + $streakBonus;

        // Update streak
        $newStreak = $isCorrect ? $session->streak + 1 : 0;
        $maxStreak = max($session->max_streak, $newStreak);

        // Tandai soal sudah dijawab
        $questions[$qIndex]['answered']  = $answer;
        $questions[$qIndex]['is_correct'] = $isCorrect;

        // Log jawaban
        $log   = $session->answers_log ?? [];
        $log[] = [
            'q_index'       => $qIndex,
            'answer'        => $answer,
            'correct'       => $question['correct'],
            'is_correct'    => $isCorrect,
            'time_taken'    => $timeTaken,
            'points_earned' => $totalPoints,
        ];

        // Adaptive: naikkan difficulty jika streak >= threshold
        $newDifficulty = $session->difficulty;
        $streakThreshold = (int) config('quiz.streak_threshold', 3);

        if ($newStreak >= $streakThreshold && $session->difficulty < 3) {
            $newDifficulty = min(3, $session->difficulty + 1);
        }

        $session->update([
            'questions'         => $questions,
            'answers_log'       => $log,
            'current_question'  => $qIndex + 1,
            'correct_answers'   => $session->correct_answers + ($isCorrect ? 1 : 0),
            'incorrect_answers' => $session->incorrect_answers + ($isCorrect ? 0 : 1),
            'streak'            => $newStreak,
            'max_streak'        => $maxStreak,
            'score'             => $session->score + $totalPoints,
            'total_time_spent'  => $session->total_time_spent + $timeTaken,
            'difficulty'        => $newDifficulty,
        ]);

        // Penjelasan AI untuk jawaban salah (mode learning)
        $explanation = $question['explanation'] ?? '';

        if (!$isCorrect && $session->mode === 'learning') {
            try {
                $explanation = $this->aiService->explainWrongAnswer(
                    question:      $question['question'],
                    correctAnswer: $question['options'][$question['correct']],
                    wrongAnswer:   $question['options'][$answer],
                    language:      $session->language,
                    grade:         $session->grade
                );
            } catch (\Throwable) {
                // Pakai penjelasan bawaan jika AI gagal
            }
        }

        return response()->json([
            'is_correct'     => $isCorrect,
            'correct_answer' => $question['correct'],
            'correct_text'   => $question['options'][$question['correct']],
            'explanation'    => $explanation,
            'points_earned'  => $totalPoints,
            'new_streak'     => $newStreak,
            'difficulty_up'  => $newDifficulty > $session->difficulty,
            'total_score'    => $session->score + $totalPoints,
            'time_bonus'     => $timeBonus,
            'streak_bonus'   => $streakBonus,
        ]);
    }

    // ─── Complete ──────────────────────────────

    public function complete(string $token)
    {
        $session = QuizSession::where('session_token', $token)
            ->where('user_id', Auth::id())
            ->where('status', 'active')
            ->firstOrFail();

        $totalQ   = count($session->questions);
        $accuracy = $totalQ > 0
            ? round(($session->correct_answers / $totalQ) * 100, 2)
            : 0;

        DB::transaction(function () use ($session, $totalQ, $accuracy) {
            $session->update([
                'status'       => 'completed',
                'completed_at' => now(),
            ]);

            Leaderboard::create([
                'user_id'         => $session->user_id,
                'quiz_session_id' => $session->id,
                'grade'           => $session->grade,
                'subject'         => $session->subject,
                'mode'            => $session->mode,
                'score'           => $session->score,
                'correct_answers' => $session->correct_answers,
                'total_questions' => $totalQ,
                'max_streak'      => $session->max_streak,
                'time_spent'      => $session->total_time_spent,
                'accuracy'        => $accuracy,
            ]);

            $user = $session->user;
            $user->increment('total_sessions');
            $user->increment('total_score', $session->score);
            if ($session->max_streak > $user->best_streak) {
                $user->update(['best_streak' => $session->max_streak]);
            }
        });

        return Inertia::render('QuizResult', [
            'result' => [
                'score'            => $session->score,
                'correct_answers'  => $session->correct_answers,
                'total_questions'  => $totalQ,
                'accuracy'         => $accuracy,
                'max_streak'       => $session->max_streak,
                'total_time'       => $session->total_time_spent,
                'grade'            => $session->grade,
                'subject'          => $session->subject,
                'mode'             => $session->mode,
            ],
        ]);
    }

    // ─── Abandon ───────────────────────────────

    public function abandon(string $token)
    {
        QuizSession::where('session_token', $token)
            ->where('user_id', Auth::id())
            ->where('status', 'active')
            ->update(['status' => 'abandoned']);

        return redirect()->route('dashboard');
    }
}
