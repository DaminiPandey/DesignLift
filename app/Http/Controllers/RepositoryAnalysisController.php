<?php

namespace App\Http\Controllers;

use App\Models\Repository;
use App\Models\RepositoryAnalysis;
use App\Services\ClaudeService;
use App\Services\GitHubService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RepositoryAnalysisController extends Controller
{
    protected $claudeService;
    protected $githubService;

    public function __construct(ClaudeService $claudeService, GitHubService $githubService)
    {
        $this->claudeService = $claudeService;
        $this->githubService = $githubService;
    }

    public function analyze(Request $request)
    {
        $request->validate([
            'repository_name' => 'required|string',
        ]);

        try {
            // Fetch repository details from GitHub
            $repoDetails = $this->githubService->getRepositoryDetails($request->repository_name);

            // Create or get repository record
            $repository = Repository::firstOrCreate(
                ['full_name' => $request->repository_name],
                [
                    'name' => explode('/', $request->repository_name)[1],
                    'full_name' => $request->repository_name,
                    'url' => "https://github.com/{$request->repository_name}",
                    'github_id' => $repoDetails['id'] ?? null,
                    'description' => $repoDetails['description'] ?? null,
                    'user_id' => Auth::id()
                ]
            );

            // Get repository metrics
            $repoData = $this->githubService->getRepositoryContent(
                $request->repository_name
            );

            Log::info('Repository data received', ['data' => $repoData]);

            // Ensure we have an array with required structure
            if (!is_array($repoData)) {
                $repoData = [
                    'commit_frequency' => 0,
                    'code_churn' => 0,
                    'files' => []
                ];
            }

            // Ensure files key exists
            if (!isset($repoData['files'])) {
                $repoData['files'] = [];
            }

            // Get AI analysis for main files
            $fileAnalyses = [];
            foreach ($repoData['files'] as $file) {
                if (!is_array($file) || !isset($file['content']) || !isset($file['name'])) {
                    Log::warning('Invalid file data structure', ['file' => $file]);
                    continue;
                }

                try {
                    $analysis = $this->claudeService->analyzeCode($file['content']);
                    if (
                        is_array($analysis) &&
                        isset($analysis['complexity_score']) &&
                        isset($analysis['quality_score'])
                    ) {
                        $fileAnalyses[$file['name']] = $analysis;
                    }
                } catch (\Exception $e) {
                    Log::warning("Failed to analyze file: {$file['name']}", [
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Calculate overall metrics with safe defaults
            $metrics = [
                'commit_frequency' => round($repoData['commit_frequency'] ?? 0, 2),
                'code_churn' => round($repoData['code_churn'] ?? 0, 2),
                'file_analyses' => $fileAnalyses,
                'summary' => [
                    'average_complexity' => $this->calculateAverageMetric($fileAnalyses, 'complexity_score'),
                    'average_quality' => $this->calculateAverageMetric($fileAnalyses, 'quality_score'),
                    'files_analyzed' => count($fileAnalyses)
                ]
            ];

            // Save analysis using the local repository ID
            $repositoryAnalysis = RepositoryAnalysis::create([
                'repository_id' => $repository->id, // Use the local repository ID
                'content' => json_encode($repoData),
                'analysis' => $metrics,
                'user_id' => Auth::id(),
            ]);

            // Store analysis in session for branch stats page
            session()->put("branch_analysis_{$request->branch}", $metrics);

            return response()->json([
                'status' => 'success',
                'analysis' => $metrics
            ]);
        } catch (\Exception $e) {
            Log::error('Analysis failed', [
                'error' => $e->getMessage(),
                'repository' => $request->repository_name,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to analyze repository: ' . $e->getMessage()
            ], 500);
        }
    }

    private function calculateAverageMetric($fileAnalyses, $metricKey)
    {
        if (empty($fileAnalyses)) {
            return 0;
        }

        $sum = 0;
        $count = 0;

        foreach ($fileAnalyses as $analysis) {
            if (isset($analysis[$metricKey])) {
                $sum += $analysis[$metricKey];
                $count++;
            }
        }

        return $count > 0 ? round($sum / $count, 2) : 0;
    }

    public function show(RepositoryAnalysis $analysis)
    {
        return response()->json($analysis);
    }

    public function showBranchStats($branch)
    {
        return Inertia::render('BranchStats', [
            'branch' => $branch,
            'analysis' => session()->get("branch_analysis_{$branch}", [])
        ]);
    }
}
