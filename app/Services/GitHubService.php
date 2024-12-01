<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Jobs\PerformDeepAnalysis;
use App\Jobs\DeepAnalysisJob;

class GitHubService
{
    protected $baseUrl = 'https://api.github.com';
    protected $maxFilesToAnalyze = 10; // Limit number of files to analyze
    protected $timeout = 30; // Timeout in seconds
    protected $projectType = null;
    protected $deepAnalysis = false;

    public function getRepositoryContent($repoFullName, $deep = false)
    {
        try {
            $this->deepAnalysis = $deep;
            Log::info('Starting repository analysis', [
                'repo' => $repoFullName,
                'deep_analysis' => $deep
            ]);

            // First identify project type
            $this->identifyProjectType($repoFullName);
            Log::info('Project type identified', ['type' => $this->projectType]);

            // Get repository stats
            $stats = $this->getRepositoryStats($repoFullName);
            Log::info('Repository stats fetched', ['stats' => $stats]);

            // Get files for analysis
            $files = $this->getMainFiles($repoFullName);
            Log::info('Files fetched', ['count' => count($files)]);

            $result = [
                'commit_frequency' => $stats['commit_frequency'],
                'code_churn' => $stats['code_churn'],
                'files' => $files,
                'project_type' => $this->projectType,
                'framework_details' => $this->getFrameworkDetails($repoFullName)
            ];

            if ($deep) {
                Cache::put("deep_analysis_status_{$repoFullName}", 'queued', 3600);
                DeepAnalysisJob::dispatch($repoFullName, Auth::id());
                $result['deep_analysis_pending'] = true;
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Repository analysis failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'commit_frequency' => 0,
                'code_churn' => 0,
                'files' => [],
                'project_type' => 'Unknown',
                'framework_details' => [
                    'framework' => 'Unknown',
                    'version' => 'Unknown',
                    'major_dependencies' => []
                ]
            ];
        }
    }

    protected function queueDeepAnalysis($repoFullName)
    {
        Cache::put("deep_analysis_status_{$repoFullName}", 'queued', 3600);
        DeepAnalysisJob::dispatch($repoFullName, Auth::id());
    }

    public function getDeepAnalysisStatus($repoFullName)
    {
        return [
            'status' => Cache::get("deep_analysis_status_{$repoFullName}", 'not_started'),
            'result' => Cache::get("deep_analysis_result_{$repoFullName}"),
            'error' => Cache::get("deep_analysis_error_{$repoFullName}")
        ];
    }

    protected function getBasicAnalysis($repoFullName)
    {
        $this->identifyProjectType($repoFullName);
        $stats = $this->getRepositoryStats($repoFullName);
        $files = $this->getMainFiles($repoFullName);

        return [
            'commit_frequency' => $stats['commit_frequency'],
            'code_churn' => $stats['code_churn'],
            'files' => $files,
            'project_type' => $this->projectType,
            'framework_details' => $this->getFrameworkDetails($repoFullName)
        ];
    }

    protected function identifyProjectType($repoFullName)
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => 'token ' . Auth::user()->github_token,
                    'Accept' => 'application/vnd.github.v3+json',
                ])->get("{$this->baseUrl}/repos/{$repoFullName}/contents");

            if ($response->successful()) {
                $contents = $response->json();
                $fileNames = array_column($contents, 'name');

                // Check for Laravel
                if (in_array('artisan', $fileNames) && in_array('composer.json', $fileNames)) {
                    $this->projectType = 'Laravel';
                    return;
                }

                // Check for React Native
                if (in_array('package.json', $fileNames)) {
                    $packageJson = $this->getFileContent($repoFullName, 'package.json');
                    if ($packageJson) {
                        $package = json_decode($packageJson, true);
                        if (isset($package['dependencies']['react-native'])) {
                            $this->projectType = 'React Native';
                            return;
                        }
                        if (isset($package['dependencies']['react'])) {
                            $this->projectType = 'React';
                            return;
                        }
                    }
                }

                // Check for Vue.js
                if (in_array('package.json', $fileNames)) {
                    $packageJson = $this->getFileContent($repoFullName, 'package.json');
                    if ($packageJson) {
                        $package = json_decode($packageJson, true);
                        if (isset($package['dependencies']['vue'])) {
                            $this->projectType = 'Vue.js';
                            return;
                        }
                    }
                }

                // Check for Angular
                if (in_array('angular.json', $fileNames)) {
                    $this->projectType = 'Angular';
                    return;
                }

                // Default to Unknown
                $this->projectType = 'Unknown';
            }
        } catch (\Exception $e) {
            Log::error('Failed to identify project type', ['error' => $e->getMessage()]);
            $this->projectType = 'Unknown';
        }
    }

    protected function getProjectFiles($repoFullName)
    {
        if (!$this->deepAnalysis) {
            return $this->getMainFiles($repoFullName);
        }

        // Get all files recursively based on project type
        $files = [];
        $importantPaths = $this->getImportantPaths();
        
        foreach ($importantPaths as $path) {
            $this->getFilesRecursively($repoFullName, $path, $files);
        }

        return $files;
    }

    protected function getImportantPaths()
    {
        switch ($this->projectType) {
            case 'Laravel':
                return ['app/', 'config/', 'routes/', 'resources/views/', 'database/migrations/'];
            case 'React':
            case 'React Native':
                return ['src/', 'components/', 'pages/', 'navigation/', 'services/'];
            case 'Vue.js':
                return ['src/', 'components/', 'views/', 'store/', 'router/'];
            case 'Angular':
                return ['src/app/', 'src/environments/', 'src/assets/'];
            default:
                return [''];
        }
    }

    protected function getFilesRecursively($repoFullName, $path, &$files)
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => 'token ' . Auth::user()->github_token,
                    'Accept' => 'application/vnd.github.v3+json',
                ])->get("{$this->baseUrl}/repos/{$repoFullName}/contents/{$path}");

            if ($response->successful()) {
                $contents = $response->json();
                foreach ($contents as $item) {
                    if ($item['type'] === 'file' && $this->isAnalyzableFile($item['name'])) {
                        $content = $this->getFileContent($repoFullName, $item['path']);
                        if ($content) {
                            $files[] = [
                                'name' => $item['path'],
                                'content' => $content,
                                'type' => pathinfo($item['name'], PATHINFO_EXTENSION)
                            ];
                        }
                    } elseif ($item['type'] === 'dir') {
                        $this->getFilesRecursively($repoFullName, $item['path'], $files);
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to get files recursively', [
                'path' => $path,
                'error' => $e->getMessage()
            ]);
        }
    }

    protected function getFrameworkDetails($repoFullName)
    {
        $details = [
            'framework' => $this->projectType,
            'version' => 'Unknown',
            'major_dependencies' => []
        ];

        try {
            switch ($this->projectType) {
                case 'Laravel':
                    $composerJson = $this->getFileContent($repoFullName, 'composer.json');
                    if ($composerJson) {
                        $composer = json_decode($composerJson, true);
                        $details['version'] = $composer['require']['laravel/framework'] ?? 'Unknown';
                        $details['major_dependencies'] = $composer['require'] ?? [];
                    }
                    break;

                case 'React':
                case 'React Native':
                case 'Vue.js':
                    $packageJson = $this->getFileContent($repoFullName, 'package.json');
                    if ($packageJson) {
                        $package = json_decode($packageJson, true);
                        $details['version'] = $package['dependencies'][$this->projectType === 'Vue.js' ? 'vue' : 'react'] ?? 'Unknown';
                        $details['major_dependencies'] = $package['dependencies'] ?? [];
                    }
                    break;
            }
        } catch (\Exception $e) {
            Log::error('Failed to get framework details', ['error' => $e->getMessage()]);
        }

        return $details;
    }

    protected function getMainFiles($repoFullName)
    {
        try {
            Log::info('Fetching main files', ['repo' => $repoFullName]);
            
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => 'token ' . Auth::user()->github_token,
                    'Accept' => 'application/vnd.github.v3+json',
                ])->get("{$this->baseUrl}/repos/{$repoFullName}/contents");

            if ($response->successful()) {
                $files = [];
                $contents = $response->json();
                
                Log::info('Root directory contents fetched', [
                    'total_files' => count($contents)
                ]);

                foreach ($contents as $item) {
                    if ($item['type'] === 'file') {
                        $content = $this->getFileContent($repoFullName, $item['path']);
                        if ($content) {
                            $files[] = [
                                'name' => $item['path'],
                                'content' => $content,
                                'size' => $item['size'],
                                'type' => pathinfo($item['name'], PATHINFO_EXTENSION) ?: 'other'
                            ];
                            
                            Log::info('Added file for analysis', [
                                'name' => $item['path'],
                                'size' => $item['size']
                            ]);
                        }
                    }
                }

                return $files;
            }

            Log::error('Failed to fetch repository contents', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return [];
        } catch (\Exception $e) {
            Log::error('Failed to get main files', [
                'error' => $e->getMessage(),
                'repo' => $repoFullName
            ]);
            return [];
        }
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
                    $content = base64_decode($data['content']);
                    Log::info('File content fetched', [
                        'path' => $path,
                        'size' => strlen($content)
                    ]);
                    return $content;
                }
            }

            Log::warning('Failed to get file content', [
                'path' => $path,
                'status' => $response->status()
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting file content', [
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

    // Add method to get progress
    public function getAnalysisProgress($repoFullName)
    {
        return Cache::get("analysis_progress_{$repoFullName}", 0);
    }

    // Add the performDeepAnalysis method
    public function performDeepAnalysis($repoFullName)
    {
        try {
            $startTime = time();
            $timeLimit = 30; // 30 seconds limit
            
            $files = [];
            $importantPaths = $this->getImportantPaths();
            $totalPaths = count($importantPaths);
            $processedPaths = 0;
            
            foreach ($importantPaths as $path) {
                // Check if we've exceeded our time limit
                if (time() - $startTime >= $timeLimit) {
                    Log::info('Deep analysis time limit reached', [
                        'processed_paths' => $processedPaths,
                        'total_paths' => $totalPaths
                    ]);
                    break;
                }

                $this->getFilesRecursively($repoFullName, $path, $files);
                $processedPaths++;
                
                $progress = ($processedPaths / $totalPaths) * 100;
                Cache::put("analysis_progress_{$repoFullName}", $progress, 600);
            }

            // Get repository stats
            $stats = $this->getRepositoryStats($repoFullName);
            
            // Get framework details
            $frameworkDetails = $this->getFrameworkDetails($repoFullName);
            
            // Analyze files within time limit
            $fileAnalyses = [];
            foreach ($files as $file) {
                // Check time limit again
                if (time() - $startTime >= $timeLimit) {
                    Log::info('File analysis time limit reached', [
                        'analyzed_files' => count($fileAnalyses),
                        'total_files' => count($files)
                    ]);
                    break;
                }

                try {
                    $analysis = app(ClaudeService::class)->analyzeCode($file['content']);
                    if (is_array($analysis) && 
                        isset($analysis['complexity_score']) && 
                        isset($analysis['quality_score'])) {
                        $fileAnalyses[$file['name']] = $analysis;
                    }
                } catch (\Exception $e) {
                    Log::warning("Failed to analyze file: {$file['name']}", [
                        'error' => $e->getMessage()
                    ]);
                    continue;
                }
            }

            $result = [
                'commit_frequency' => $stats['commit_frequency'],
                'code_churn' => $stats['code_churn'],
                'files' => $files,
                'file_analyses' => $fileAnalyses,
                'project_type' => $this->projectType,
                'framework_details' => $frameworkDetails,
                'summary' => [
                    'total_files' => count($files),
                    'analyzed_files' => count($fileAnalyses),
                    'analysis_completed' => (time() - $startTime < $timeLimit),
                    'time_taken' => time() - $startTime,
                    'average_complexity' => $this->calculateAverageMetric($fileAnalyses, 'complexity_score'),
                    'average_quality' => $this->calculateAverageMetric($fileAnalyses, 'quality_score')
                ]
            ];

            Log::info('Deep analysis completed', [
                'time_taken' => time() - $startTime,
                'files_analyzed' => count($fileAnalyses),
                'total_files_found' => count($files)
            ]);

            return $result;

        } catch (\Exception $e) {
            Log::error('Deep analysis failed', [
                'error' => $e->getMessage(),
                'repo' => $repoFullName
            ]);
            throw $e;
        }
    }

    protected function calculateAverageMetric($fileAnalyses, $metricKey)
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
}
