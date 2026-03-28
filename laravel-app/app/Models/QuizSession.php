<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizSession extends Model
{
    protected $fillable = [
        'user_id','session_token','grade','subject','language',
        'mode','difficulty','current_question','correct_answers',
        'incorrect_answers','streak','max_streak','score',
        'total_time_spent','questions','answers_log','status',
        'started_at','completed_at',
    ];

    protected $casts = [
        'questions'    => 'array',
        'answers_log'  => 'array',
        'started_at'   => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
