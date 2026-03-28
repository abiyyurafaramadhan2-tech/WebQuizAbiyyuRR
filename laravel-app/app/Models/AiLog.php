<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiLog extends Model
{
    protected $fillable = [
        'user_id','quiz_session_id','provider','model','action',
        'prompt_summary','tokens_used','response_time_ms',
        'success','error_message',
    ];

    protected $casts = [
        'success' => 'boolean',
    ];
}
