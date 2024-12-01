<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use App\Services\GitHubService;

class DeepAnalysisJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $repoFullName;
    protected $userId;

    public function __construct($repoFullName, $userId)
    {
        $this->repoFullName = $repoFullName;
        $this->userId = $userId;
    }

    public function handle(GitHubService $githubService)
    {
        try {
            Cache::put("deep_analysis_status_{$this->repoFullName}", 'processing', 3600);
            
            $result = $githubService->performDeepAnalysis($this->repoFullName);
            
            Cache::put("deep_analysis_result_{$this->repoFullName}", $result, 3600);
            Cache::put("deep_analysis_status_{$this->repoFullName}", 'completed', 3600);
            
        } catch (\Exception $e) {
            Cache::put("deep_analysis_status_{$this->repoFullName}", 'failed', 3600);
            Cache::put("deep_analysis_error_{$this->repoFullName}", $e->getMessage(), 3600);
        }
    }
} 