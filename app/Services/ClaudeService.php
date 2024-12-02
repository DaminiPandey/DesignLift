<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClaudeService
{
    protected $apiKey;
    protected $apiUrl = 'https://api.anthropic.com/v1/messages';

    public function __construct()
    {
        $this->apiKey = config('services.claude.key');
    }

    public function analyzeCode($codeContent)
    {
        try {
            // Truncate content if too large
            $codeContent = substr($codeContent, 0, 8000);

            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->post($this->apiUrl, [
                'model' => 'claude-3-opus-20240229',
                'max_tokens' => 1000,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $this->buildPrompt($codeContent)
                    ]
                ]
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                
                // Log the raw response for debugging
                Log::info('Claude API Response', ['response' => $responseData]);

                try {
                    if (isset($responseData['content'][0]['text'])) {
                        // Try to parse the JSON response from Claude
                        $analysisText = $responseData['content'][0]['text'];
                        $analysisData = json_decode($analysisText, true);

                        if (json_last_error() === JSON_ERROR_NONE && is_array($analysisData)) {
                            return [
                                'complexity_score' => $analysisData['complexity_score'] ?? 5,
                                'quality_score' => $analysisData['quality_score'] ?? 5,
                                'suggestions' => $analysisData['suggestions'] ?? ['No specific suggestions provided']
                            ];
                        }
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to parse Claude response', [
                        'error' => $e->getMessage(),
                        'response' => $responseData
                    ]);
                }
            } else {
                Log::error('Claude API Error', [
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
            }

            // Return default metrics if anything fails
            return [
                'complexity_score' => 5,
                'quality_score' => 5,
                'suggestions' => ['Default analysis - API processing failed']
            ];

        } catch (\Exception $e) {
            Log::error('Claude Service Error', [
                'message' => $e->getMessage()
            ]);
            
            return [
                'complexity_score' => 5,
                'quality_score' => 5,
                'suggestions' => ['Error occurred during analysis']
            ];
        }
    }

    protected function buildPrompt($codeContent)
    {
        return <<<EOT
        Analyze this code and provide ONLY a JSON response in the following format, with no additional text:
        {
            "complexity_score": <number between 1-10>,
            "quality_score": <number between 1-10>,
            "suggestions": [
                "<brief improvement suggestion 1>",
                "<brief improvement suggestion 2>",
                "<brief improvement suggestion 3>"
            ]
        }

        Code to analyze:
        $codeContent
        EOT;
    }
}
