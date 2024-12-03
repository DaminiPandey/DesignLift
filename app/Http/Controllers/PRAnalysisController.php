<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use App\Services\ClaudeService;
use Inertia\Inertia;

class PRAnalysisController extends Controller
{
    protected $claudeService;

    public function __construct(ClaudeService $claudeService)
    {
        $this->claudeService = $claudeService;
    }

    public function index()
    {
        return Inertia::render('PRAnalysis');
    }

    public function getPullRequests()
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
            ])->get("https://api.github.com/repos/{$repoFullName}/pulls", [
                'state' => 'open'
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'error' => 'Failed to fetch pull requests'
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch pull requests: ' . $e->getMessage()
            ], 500);
        }
    }

    public function analyzePR($prNumber)
    {
        try {
            $repoFullName = session('current_repository');
            
            // Get PR details including the diff
            $response = Http::withHeaders([
                'Authorization' => 'token ' . Auth::user()->github_token,
                'Accept' => 'application/vnd.github.v3.diff',
            ])->get("https://api.github.com/repos/{$repoFullName}/pulls/{$prNumber}");

            if ($response->successful()) {
                $diff = $response->body();
                
                // Analyze the diff using Claude
                $analysis = $this->claudeService->analyzeCode($diff);

                return response()->json([
                    'analysis' => $analysis
                ]);
            }

            return response()->json([
                'error' => 'Failed to fetch PR details'
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to analyze PR: ' . $e->getMessage()
            ], 500);
        }
    }
} 