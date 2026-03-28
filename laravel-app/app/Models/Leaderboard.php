<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Leaderboard extends Model
{
    protected $fillable = [
        'user_id','quiz_session_id','grade','subject','mode',
        'score','correct_answers','total_questions','max_streak',
        'time_spent','accuracy',
    ];

    protected $casts = [
        'accuracy' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
