<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class RepositoryStatsController extends Controller
{
  public function getStats()
  {
    try {
      $user = Auth::user();
      $repoFullName = session('current_repository');

      Log::info('Fetching stats for repository', [
        'repo' => $repoFullName,
        'user' => $user->id
      ]);

      if (!$repoFullName) {
        return response()->json([
          'error' => 'No repository selected. Please select a repository first.'
        ], 400);
      }

      return response()->json([
        'pullRequests' => $this->getPullRequestStats($repoFullName),
        'commits' => $this->getCommitStats($repoFullName),
        'languages' => $this->getLanguagesStats($repoFullName),
        'summary' => $this->getRepositorySummary($repoFullName)
      ]);
    } catch (\Exception $e) {
      Log::error('Failed to get repository stats', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      
      return response()->json([
        'error' => 'Failed to fetch repository stats: ' . $e->getMessage()
      ], 500);
    }
  }

  public function index()
  {
    return Inertia::render('OverviewStats');
  }

  private function getPullRequestStats($repoFullName)
  {
    $response = Http::withHeaders([
      'Authorization' => 'token ' . Auth::user()->github_token,
      'Accept' => 'application/vnd.github.v3+json',
    ])->get("https://api.github.com/repos/{$repoFullName}/pulls", [
      'state' => 'all',
      'per_page' => 100
    ]);

    if ($response->successful()) {
      $prs = $response->json();
      $prsByUser = [];

      foreach ($prs as $pr) {
        $user = $pr['user']['login'];
        if (!isset($prsByUser[$user])) {
          $prsByUser[$user] = 0;
        }
        $prsByUser[$user]++;
      }

      return collect($prsByUser)->map(function ($count, $user) {
        return ['user' => $user, 'count' => $count];
      })->values()->all();
    }

    return [];
  }

  private function getCommitStats($repoFullName)
  {
    try {
      $response = Http::withHeaders([
        'Authorization' => 'token ' . Auth::user()->github_token,
        'Accept' => 'application/vnd.github.v3+json',
      ])->get("https://api.github.com/repos/{$repoFullName}/stats/participation");

      if ($response->successful()) {
        $data = $response->json();
        if (!isset($data['all'])) {
          Log::warning('No participation data found', [
            'repo' => $repoFullName,
            'response' => $data
          ]);
          return [];
        }

        $weeklyData = $data['all'];
        
        return collect($weeklyData)->map(function ($count, $index) use ($weeklyData) {
          return [
            'date' => Carbon::now()->subWeeks(count($weeklyData) - $index - 1)->format('Y-m-d'),
            'count' => $count
          ];
        })->all();
      }

      Log::error('Failed to get commit stats', [
        'repo' => $repoFullName,
        'status' => $response->status(),
        'response' => $response->body()
      ]);

      return [];
    } catch (\Exception $e) {
      Log::error('Error in getCommitStats', [
        'error' => $e->getMessage(),
        'repo' => $repoFullName
      ]);
      return [];
    }
  }

  private function getRepositorySummary($repoFullName)
  {
    $response = Http::withHeaders([
      'Authorization' => 'token ' . Auth::user()->github_token,
      'Accept' => 'application/vnd.github.v3+json',
    ])->get("https://api.github.com/repos/{$repoFullName}");

    if ($response->successful()) {
      $repo = $response->json();

      return [
        'totalPRs' => $repo['open_issues_count'],
        'totalCommits' => $this->getTotalCommits($repoFullName),
        'activeContributors' => $this->getActiveContributors($repoFullName)
      ];
    }

    return [
      'totalPRs' => 0,
      'totalCommits' => 0,
      'activeContributors' => 0
    ];
  }

  private function getTotalCommits($repoFullName)
  {
    $response = Http::withHeaders([
      'Authorization' => 'token ' . Auth::user()->github_token,
      'Accept' => 'application/vnd.github.v3+json',
    ])->get("https://api.github.com/repos/{$repoFullName}/commits", [
      'per_page' => 1
    ]);

    return $response->header('Link') ?
      $this->extractTotalFromLink($response->header('Link')) :
      0;
  }

  private function getActiveContributors($repoFullName)
  {
    $response = Http::withHeaders([
      'Authorization' => 'token ' . Auth::user()->github_token,
      'Accept' => 'application/vnd.github.v3+json',
    ])->get("https://api.github.com/repos/{$repoFullName}/contributors");

    return $response->successful() ? count($response->json()) : 0;
  }

  private function extractTotalFromLink($link)
  {
    if (preg_match('/page=(\d+)>; rel="last"/', $link, $matches)) {
      return (int) $matches[1];
    }
    return 0;
  }

  private function getLanguagesStats($repoFullName)
  {
    $response = Http::withHeaders([
      'Authorization' => 'token ' . Auth::user()->github_token,
      'Accept' => 'application/vnd.github.v3+json',
    ])->get("https://api.github.com/repos/{$repoFullName}/languages");

    if ($response->successful()) {
      $languages = $response->json();
      $total = array_sum($languages);

      return collect($languages)
        ->map(function ($bytes, $language) use ($total) {
          return [
            'name' => $language,
            'value' => round(($bytes / $total) * 100, 2)
          ];
        })
        ->values()
        ->all();
    }

    return [];
  }
}
