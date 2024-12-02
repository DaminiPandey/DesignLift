<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class GitHubService
{
    protected $baseUrl = 'https://api.github.com';
    protected $maxFilesToAnalyze = 10; // Limit number of files to analyze
    protected $timeout = 30; // Timeout in seconds

    public function getRepositoryContent($repoFullName)
    {
        try {
            // Validate token first
            $this->validateGitHubToken();

            $cacheKey = "repo_content_{$repoFullName}";
            // return Cache::remember($cacheKey, 3600, function () use ($repoFullName) {
                Log::info('Starting repository analysis', ['repo' => $repoFullName]);

            // Get repository stats
            $stats = $this->getRepositoryStats($repoFullName);

            // Get main files for analysis (limited)
            $files = $this->getMainFiles($repoFullName);

            $result = [
                'commit_frequency' => $stats['commit_frequency'],
                'code_churn' => $stats['code_churn'],
                'files' => $files
            ];

            Log::info('Repository analysis completed', [
                'metrics' => [
                    'commit_frequency' => $result['commit_frequency'],
                    'code_churn' => $result['code_churn'],
                    'files_count' => count($result['files'])
                ]
            ]);

                return $result;
            // });
        } catch (\Exception $e) {
            Log::error('Repository analysis failed', [
                'error' => $e->getMessage(),
                'repo' => $repoFullName
            ]);
            return [
                'commit_frequency' => 0,
                'code_churn' => 0,
                'files' => []
            ];
        }
    }

    protected function getMainFiles($repoFullName)
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => 'token ' . Auth::user()->github_token,
                    'Accept' => 'application/vnd.github.v3+json',
                ])->get("{$this->baseUrl}/repos/{$repoFullName}/contents");

            if ($response->successful()) {
                $files = [];
                $contents = $response->json();
                $analyzedCount = 0;

                Log::info("===============>" . count($contents));

                foreach ($contents as $item) {
                    if ($analyzedCount >= $this->maxFilesToAnalyze) {
                        break;
                    }

                    if ($this->isAnalyzableFile($item['name'])) {
                        $content = $this->getFileContent($repoFullName, $item['path']);
                        Log::info("========34543=======>" . json_encode($item));
                        if ($content) {
                            $files[] = [
                                'name' => $item['path'],
                                'content' => $content
                            ];
                            $analyzedCount++;
                        }
                    }
                }
                Log::info("===============>" . $analyzedCount);
                return $files;
            }
        } catch (\Exception $e) {
            Log::error('Failed to get repository files', [
                'error' => $e->getMessage(),
                'repo' => $repoFullName
            ]);
        }
        return [];
    }

    protected function getFileContent($repoFullName, $path)
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => 'token ' . Auth::user()->github_token,
                    'Accept' => 'application/vnd.github.v3+json',
                ])->get("{$this->baseUrl}/repos/{$repoFullName}/contents/{$path}");

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['content'])) {
                    return base64_decode($data['content']);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to get file content', [
                'path' => $path,
                'error' => $e->getMessage()
            ]);
        }
        return null;
    }

    protected function getRepositoryStats($repoFullName)
    {
        $stats = [
            'commit_frequency' => 0,
            'code_churn' => 0
        ];

        try {
            // Get commit activity
            $commitActivity = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => 'token ' . Auth::user()->github_token,
                    'Accept' => 'application/vnd.github.v3+json',
                ])->get("{$this->baseUrl}/repos/{$repoFullName}/stats/participation");

            if ($commitActivity->successful()) {
                $weeklyCommits = $commitActivity->json()['all'] ?? [];
                if (!empty($weeklyCommits)) {
                    $totalCommits = array_sum($weeklyCommits);
                    $stats['commit_frequency'] = $totalCommits / count($weeklyCommits);
                }
            }

            // Get code frequency
            $codeFrequency = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => 'token ' . Auth::user()->github_token,
                    'Accept' => 'application/vnd.github.v3+json',
                ])->get("{$this->baseUrl}/repos/{$repoFullName}/stats/code_frequency");

            if ($codeFrequency->successful()) {
                $weeklyChanges = $codeFrequency->json();
                if (!empty($weeklyChanges)) {
                    $totalChurn = 0;
                    foreach ($weeklyChanges as $week) {
                        $totalChurn += abs($week[1] ?? 0) + abs($week[2] ?? 0);
                    }
                    $stats['code_churn'] = $totalChurn / count($weeklyChanges);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to get repository stats', [
                'error' => $e->getMessage(),
                'repo' => $repoFullName
            ]);
        }

        return $stats;
    }

    protected function isAnalyzableFile($filename)
    {
        $extensions = ['php', 'js', 'jsx', 'ts', 'tsx', 'vue', 'css', 'json', '.config.js', 'tsx'];
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        return in_array($ext, $extensions);
    }

    public function getRepositoryDetails($repoFullName)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'token ' . Auth::user()->github_token,
                'Accept' => 'application/vnd.github.v3+json',
            ])->get("{$this->baseUrl}/repos/{$repoFullName}");

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Failed to fetch repository details', [
                'repo' => $repoFullName,
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return [
                'id' => null,
                'description' => null
            ];
        } catch (\Exception $e) {
            Log::error('Error fetching repository details', [
                'error' => $e->getMessage(),
                'repo' => $repoFullName
            ]);
            return [
                'id' => null,
                'description' => null
            ];
        }
    }

    protected function validateGitHubToken()
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'token ' . Auth::user()->github_token,
                'Accept' => 'application/vnd.github.v3+json',
            ])->get("{$this->baseUrl}/user");

            if (!$response->successful()) {
                Log::error('GitHub token validation failed', [
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                throw new \Exception('Invalid GitHub token');
            }

            return true;
        } catch (\Exception $e) {
            Log::error('GitHub token validation error', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
