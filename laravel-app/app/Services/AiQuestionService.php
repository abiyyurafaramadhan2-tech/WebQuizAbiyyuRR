<?php

namespace App\Services;

use App\Models\AiLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiQuestionService
{
    private string $provider;
    private string $apiKey;
    private string $model;

    private const SUBJECTS = [
        'math'       => ['id'=>'Matematika',           'en'=>'Mathematics'],
        'science'    => ['id'=>'IPA',                  'en'=>'Natural Science'],
        'indonesian' => ['id'=>'Bahasa Indonesia',     'en'=>'Indonesian Language'],
        'english'    => ['id'=>'Bahasa Inggris',       'en'=>'English Language'],
        'history'    => ['id'=>'Sejarah',              'en'=>'History'],
        'civics'     => ['id'=>'PKN',                  'en'=>'Civic Education'],
        'geography'  => ['id'=>'Geografi',             'en'=>'Geography'],
        'biology'    => ['id'=>'Biologi',              'en'=>'Biology'],
        'chemistry'  => ['id'=>'Kimia',                'en'=>'Chemistry'],
        'physics'    => ['id'=>'Fisika',               'en'=>'Physics'],
        'economics'  => ['id'=>'Ekonomi',              'en'=>'Economics'],
        'arts'       => ['id'=>'Seni Budaya',          'en'=>'Arts & Culture'],
    ];

    private const DIFFICULTY = [
        1 => 'mudah, cocok untuk latihan dasar, pertanyaan langsung',
        2 => 'sedang, perlu pemahaman konsep, ada aplikasi sederhana',
        3 => 'sulit, analitis, multi-langkah, butuh pemikiran kritis',
    ];

    public function __construct()
    {
        $this->provider = config('services.ai_provider', env('AI_PROVIDER', 'gemini'));
        $this->apiKey   = $this->provider === 'openai'
            ? env('OPENAI_API_KEY', '')
            : env('GEMINI_API_KEY', '');
        $this->model    = $this->provider === 'openai'
            ? env('OPENAI_MODEL', 'gpt-4o-mini')
            : env('GEMINI_MODEL', 'gemini-1.5-flash');
    }

    /**
     * Generate soal quiz via AI
     */
    public function generateQuestions(
        string $grade,
        string $subject,
        string $language = 'id',
        int $difficulty = 1,
        int $count = 10,
        ?int $sessionId = null,
        ?int $userId = null
    ): array {
        $gradeNum    = (int) filter_var($grade, FILTER_SANITIZE_NUMBER_INT);
        $subjectName = self::SUBJECTS[$subject][$language] ?? $subject;
        $diffText    = self::DIFFICULTY[$difficulty] ?? self::DIFFICULTY[1];

        $langInstruction = $language === 'id'
            ? 'Semua pertanyaan dan jawaban HARUS dalam Bahasa Indonesia yang baik.'
            : 'All questions and answers MUST be in clear English.';

        $prompt = <<<PROMPT
Kamu adalah guru ahli kurikulum Indonesia. Buat soal quiz untuk kelas {$gradeNum}.

Mata pelajaran: {$subjectName}
Kelas: {$gradeNum} (Kurikulum Merdeka Indonesia)
Tingkat kesulitan: {$diffText}
Bahasa: {$langInstruction}

Buat tepat {$count} soal pilihan ganda. Gunakan format JSON ini PERSIS (tanpa teks tambahan):

{
  "questions": [
    {
      "id": 1,
      "question": "Teks pertanyaan?",
      "options": {
        "A": "Pilihan A",
        "B": "Pilihan B",
        "C": "Pilihan C",
        "D": "Pilihan D"
      },
      "correct": "A",
      "explanation": "Penjelasan singkat mengapa A benar.",
      "topic": "Topik spesifik"
    }
  ]
}

ATURAN PENTING:
1. Buat {$count} soal yang beragam topiknya
2. Semua pilihan harus masuk akal (tidak ada yang jelas salah)
3. Sesuai kurikulum kelas {$gradeNum}
4. Jawaban benar harus tersebar merata (tidak selalu A atau B)
5. Kembalikan JSON saja, tanpa markdown atau teks lain
PROMPT;

        $startTime = microtime(true);

        try {
            $content = $this->provider === 'openai'
                ? $this->callOpenAI($prompt)
                : $this->callGemini($prompt);

            $questions = $this->parseResponse($content);

            $this->saveLog([
                'user_id'          => $userId,
                'quiz_session_id'  => $sessionId,
                'provider'         => $this->provider,
                'model'            => $this->model,
                'action'           => 'generate_questions',
                'prompt_summary'   => "Kelas:{$gradeNum} Mapel:{$subject} Lang:{$language} Diff:{$difficulty}",
                'tokens_used'      => 0,
                'response_time_ms' => (int)((microtime(true) - $startTime) * 1000),
                'success'          => true,
            ]);

            return $questions;

        } catch (\Throwable $e) {
            Log::error('AI Error: ' . $e->getMessage());

            $this->saveLog([
                'user_id'          => $userId,
                'quiz_session_id'  => $sessionId,
                'provider'         => $this->provider,
                'model'            => $this->model,
                'action'           => 'generate_questions',
                'prompt_summary'   => "Kelas:{$gradeNum} Mapel:{$subject}",
                'tokens_used'      => 0,
                'response_time_ms' => (int)((microtime(true) - $startTime) * 1000),
                'success'          => false,
                'error_message'    => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Generate penjelasan lucu untuk jawaban salah
     */
    public function explainWrongAnswer(
        string $question,
        string $correctAnswer,
        string $wrongAnswer,
        string $language = 'id',
        string $grade = 'grade_7'
    ): string {
        $gradeNum = (int) filter_var($grade, FILTER_SANITIZE_NUMBER_INT);
        $isKid    = $gradeNum <= 6;

        $prompt = $language === 'id'
            ? <<<PROMPT
Kamu adalah ChubbyGenius, tutor AI yang lucu dan menggemaskan.
Seorang murid kelas {$gradeNum} baru saja menjawab salah.

Pertanyaan: {$question}
Jawaban benar: {$correctAnswer}
Jawaban murid: {$wrongAnswer}

Tulis penjelasan SINGKAT (2-3 kalimat saja) dalam Bahasa Indonesia informal yang lucu:
1. Hibur dulu muridnya (jangan bikin down)
2. Jelaskan kenapa {$correctAnswer} benar dengan analogi yang {$isKid ? 'lucu seperti mainan atau makanan' : 'keren seperti game atau sosmed'}
3. Tutup dengan kalimat semangat + emoji

PENTING: Hanya teks biasa, tanpa markdown, singkat dan lucu!
PROMPT
            : <<<PROMPT
You are ChubbyGenius, a funny and cute AI tutor.
A grade {$gradeNum} student just got this wrong.

Question: {$question}
Correct answer: {$correctAnswer}
Student's answer: {$wrongAnswer}

Write a SHORT (2-3 sentences) funny English explanation:
1. Cheer them up first
2. Explain why {$correctAnswer} is right using a {$isKid ? 'cute food or toy analogy' : 'cool game or pop culture analogy'}
3. End with encouragement + emoji

Plain text only, no markdown, keep it short and fun!
PROMPT;

        try {
            return trim($this->provider === 'openai'
                ? $this->callOpenAI($prompt, 200)
                : $this->callGemini($prompt, 200));
        } catch (\Throwable) {
            return $language === 'id'
                ? "Hampir! Jawaban yang benar adalah: {$correctAnswer}. Terus semangat ya! 💪🔥"
                : "So close! The correct answer is: {$correctAnswer}. Keep going! 💪🔥";
        }
    }

    // ─── Private Methods ───────────────────────

    private function callOpenAI(string $prompt, int $maxTokens = 3000): string
    {
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->apiKey}",
            'Content-Type'  => 'application/json',
        ])->timeout(60)->post('https://api.openai.com/v1/chat/completions', [
            'model'       => $this->model,
            'messages'    => [
                ['role' => 'system', 'content' => 'Kamu adalah guru ahli. Selalu balas dengan JSON valid saja.'],
                ['role' => 'user',   'content' => $prompt],
            ],
            'max_tokens'  => $maxTokens,
            'temperature' => 0.7,
        ]);

        if ($response->failed()) {
            throw new \RuntimeException("OpenAI error: " . $response->body());
        }

        return $response->json('choices.0.message.content', '');
    }

    private function callGemini(string $prompt, int $maxTokens = 3000): string
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        $response = Http::timeout(60)->post($url, [
            'contents' => [
                ['parts' => [['text' => $prompt]]],
            ],
            'generationConfig' => [
                'maxOutputTokens' => $maxTokens,
                'temperature'     => 0.7,
            ],
        ]);

        if ($response->failed()) {
            throw new \RuntimeException("Gemini error: " . $response->body());
        }

        return $response->json('candidates.0.content.parts.0.text', '');
    }

    private function parseResponse(string $content): array
    {
        // Bersihkan markdown jika ada
        $content = preg_replace('/```json\s*|\s*```/', '', $content);
        $content = trim($content);

        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException("AI tidak mengembalikan JSON valid");
        }

        $questions = $data['questions'] ?? [];

        if (empty($questions)) {
            throw new \RuntimeException("AI tidak mengembalikan soal");
        }

        return array_values(array_map(function ($q, $index) {
            return [
                'id'          => $index + 1,
                'question'    => strip_tags($q['question'] ?? "Soal " . ($index + 1)),
                'options'     => [
                    'A' => strip_tags($q['options']['A'] ?? 'Pilihan A'),
                    'B' => strip_tags($q['options']['B'] ?? 'Pilihan B'),
                    'C' => strip_tags($q['options']['C'] ?? 'Pilihan C'),
                    'D' => strip_tags($q['options']['D'] ?? 'Pilihan D'),
                ],
                'correct'     => strtoupper($q['correct'] ?? 'A'),
                'explanation' => strip_tags($q['explanation'] ?? ''),
                'topic'       => $q['topic'] ?? '',
                'answered'    => null,
                'is_correct'  => null,
            ];
        }, $questions, array_keys($questions)));
    }

    private function saveLog(array $data): void
    {
        try {
            AiLog::create($data);
        } catch (\Throwable) {
            // Tidak perlu stop jika log gagal
        }
    }
}
