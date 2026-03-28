<?php

namespace App\Http\Controllers;

use App\Models\Leaderboard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $period  = $request->get('period', 'all');
        $grade   = $request->get('grade', '');
        $subject = $request->get('subject', '');

        $cacheKey = "lb_{$period}_{$grade}_{$subject}";

        $entries = Cache::remember($cacheKey, 120, function () use ($period, $grade, $subject) {
            $q = Leaderboard::with('user:id,name,avatar_emoji,avatar_color')
                ->orderByDesc('score');

            if ($grade)   $q->where('grade', $grade);
            if ($subject) $q->where('subject', $subject);

            if ($period === 'today') {
                $q->whereDate('created_at', today());
            } elseif ($period === 'week') {
                $q->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
            } elseif ($period === 'month') {
                $q->whereMonth('created_at', now()->month);
            }

            return $q->take(50)->get()->map(function ($e, $i) {
                return [
                    'rank'            => $i + 1,
                    'user_name'       => $e->user->name ?? 'Unknown',
                    'avatar_emoji'    => $e->user->avatar_emoji ?? '🧠',
                    'avatar_color'    => $e->user->avatar_color ?? '#6366f1',
                    'score'           => $e->score,
                    'accuracy'        => $e->accuracy,
                    'max_streak'      => $e->max_streak,
                    'correct'         => $e->correct_answers,
                    'total'           => $e->total_questions,
                    'grade'           => $e->grade,
                    'subject'         => $e->subject,
                    'date'            => $e->created_at->diffForHumans(),
                    'is_current_user' => $e->user_id === Auth::id(),
                ];
            });
        });

        $myBest = Leaderboard::where('user_id', Auth::id())->max('score') ?? 0;
        $myRank = Leaderboard::where('score', '>', $myBest)->count() + 1;

        return Inertia::render('Leaderboard', [
            'entries'     => $entries,
            'myBestScore' => $myBest,
            'myRank'      => $myRank,
            'filters'     => compact('period', 'grade', 'subject'),
        ]);
    }
}
