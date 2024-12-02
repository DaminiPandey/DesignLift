<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use App\Services\ClaudeService;
use Inertia\Inertia;
use Carbon\Carbon;

class ContributorAnalysisController extends Controller
{
    protected $claudeService;

    public function __construct(ClaudeService $claudeService)
    {
        $this->claudeService = $claudeService;
    }

    public function index()
    {
        return Inertia::render('Contributors');
    }

    public function getContributors()
    {
        try {
            $repoFullName = session('current_repository');
            
            if (!$repoFullName) {
                return response()->json([
                    'error' => 'No repository selected'
                ], 400);
            }

            $response = Http::withHeaders([
                'Authorization' => 'token ' . Auth::user()->github_token,
                'Accept' => 'application/vnd.github.v3+json',
            ])->get("https://api.github.com/repos/{$repoFullName}/contributors");

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'error' => 'Failed to fetch contributors'
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch contributors: ' . $e->getMessage()
            ], 500);
        }
    }

    public function analyzeContributor($username)
    {
        try {
            $repoFullName = session('current_repository');
            
            // Get contributor's commits
            $response = Http::withHeaders([
                'Authorization' => 'token ' . Auth::user()->github_token,
                'Accept' => 'application/vnd.github.v3+json',
            ])->get("https://api.github.com/repos/{$repoFullName}/commits", [
                'author' => $username
            ]);

            if ($response->successful()) {
                $commits = $response->json();
                
                // Analyze contribution patterns
                $analysis = $this->analyzeContribution($commits);

                return response()->json([
                    'analysis' => $analysis
                ]);
            }

            return response()->json([
                'error' => 'Failed to fetch contributor details'
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to analyze contributor: ' . $e->getMessage()
            ], 500);
        }
    }

    private function analyzeContribution($commits)
    {
        try {
            if (empty($commits)) {
                return [
                    'quality_score' => 0,
                    'impact_score' => 0,
                    'consistency_score' => 0,
                    'feedback' => 'No commits found to analyze.',
                    'improvements' => [
                        [
                            'title' => 'Start Contributing',
                            'description' => 'Begin contributing to get a detailed analysis of your work.'
                        ]
                    ]
                ];
            }

            // Calculate scores based on commit patterns
            $qualityScore = $this->calculateQualityScore($commits);
            $impactScore = $this->calculateImpactScore($commits);
            $consistencyScore = $this->calculateConsistencyScore($commits);

            // Generate improvements based on patterns
            $improvements = $this->generateImprovements($commits);

            // Generate feedback using Claude
            $feedback = $this->claudeService->analyzeContribution([
                'commits' => count($commits),
                'quality_score' => $qualityScore,
                'impact_score' => $impactScore,
                'consistency_score' => $consistencyScore
            ]);

            return [
                'quality_score' => $qualityScore,
                'impact_score' => $impactScore,
                'consistency_score' => $consistencyScore,
                'feedback' => $feedback,
                'improvements' => $improvements
            ];

        } catch (\Exception $e) {
            \Log::error('Error analyzing contribution', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'quality_score' => 0,
                'impact_score' => 0,
                'consistency_score' => 0,
                'feedback' => 'An error occurred while analyzing the contribution.',
                'improvements' => [
                    [
                        'title' => 'Analysis Error',
                        'description' => 'Unable to analyze commits. Please try again later.'
                    ]
                ]
            ];
        }
    }

    private function calculateQualityScore($commits)
    {
        // Implement quality scoring logic
        return rand(7, 10); // Placeholder
    }

    private function calculateImpactScore($commits)
    {
        // Implement impact scoring logic
        return rand(7, 10); // Placeholder
    }

    private function calculateConsistencyScore($commits)
    {
        // Implement consistency scoring logic
        return rand(7, 10); // Placeholder
    }

    private function generateImprovements($commits)
    {
        try {
            $improvements = [];
            
            if (empty($commits)) {
                $improvements[] = [
                    'title' => 'Start Contributing',
                    'description' => 'No commits found. Start contributing to the repository to get a detailed analysis.'
                ];
                return $improvements;
            }

            // Safely get commit messages
            $commitMessages = collect($commits)->map(function($commit) {
                return $commit['commit']['message'] ?? '';
            })->filter();

            // Safely get files
            $commitFiles = collect($commits)->map(function($commit) {
                return $commit['files'] ?? [];
            })->flatten(1)->filter();

            // Check commit message quality
            if ($commitMessages->contains(fn($msg) => strlen($msg) < 10)) {
                $improvements[] = [
                    'title' => 'Improve Commit Messages',
                    'description' => 'Write more descriptive commit messages to better explain changes and their purpose.'
                ];
            }

            // Check for large commits
            if ($commitFiles->count() > 100) {
                $improvements[] = [
                    'title' => 'Break Down Large Changes',
                    'description' => 'Consider breaking large changes into smaller, more focused commits for better review and maintenance.'
                ];
            }

            // Check commit frequency
            $commitDates = collect($commits)
                ->map(function($commit) {
                    return $commit['commit']['author']['date'] ?? null;
                })
                ->filter()
                ->map(function($date) {
                    return Carbon::parse($date);
                })
                ->sort();

            if ($commitDates->count() >= 2) {
                $firstCommit = $commitDates->first();
                $lastCommit = $commitDates->last();
                $daysDiff = $firstCommit->diffInDays($lastCommit);
                $averageDays = $daysDiff / ($commitDates->count() - 1);

                if ($averageDays > 7) {
                    $improvements[] = [
                        'title' => 'Increase Commit Frequency',
                        'description' => 'Consider committing changes more frequently. Current average is ' . round($averageDays) . ' days between commits.'
                    ];
                }
            }

            // Check test coverage
            $hasTests = $commitFiles->contains(function($file) {
                return isset($file['filename']) && str_contains($file['filename'], 'test');
            });
            
            if (!$hasTests) {
                $improvements[] = [
                    'title' => 'Add Test Coverage',
                    'description' => 'Include tests with your changes to ensure code quality and prevent regressions.'
                ];
            }

            // Check documentation
            $hasDocUpdates = $commitFiles->contains(function($file) {
                return isset($file['filename']) && (
                    str_contains($file['filename'], 'README') || 
                    str_contains($file['filename'], 'docs')
                );
            });
            
            if (!$hasDocUpdates) {
                $improvements[] = [
                    'title' => 'Update Documentation',
                    'description' => 'Keep documentation up to date with code changes to help other contributors understand the project.'
                ];
            }

            return $improvements;

        } catch (\Exception $e) {
            \Log::error('Error generating improvements', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                [
                    'title' => 'Analysis Error',
                    'description' => 'Unable to analyze commits. Please try again later.'
                ]
            ];
        }
    }
} 