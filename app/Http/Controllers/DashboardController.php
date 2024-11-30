<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function show()
    {
        $user = Auth::user();
        try {
            $client = new \GuzzleHttp\Client();
            $response = $client->get('https://api.github.com/user/repos', [
                'headers' => [
                    'Authorization' => 'token ' . $user->github_token,
                ],
            ]);
            $repositories = json_decode($response->getBody(), true);
            // Format repositories for the dropdown
            $formattedRepos = collect($repositories)->map(function ($repo) {
                return [
                    'id' => $repo['id'],
                    'name' => $repo['name'],
                    'full_name' => $repo['full_name'],
                    'description' => $repo['description'],
                    'url' => $repo['html_url']
                ];
            })->toArray();


            return Inertia::render('Dashboard/Index', [
                'repositories' => $formattedRepos
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Dashboard/Index', [
                'repositories' => [],
                'error' => 'Failed to fetch repositories: ' . $e->getMessage()
            ]);
        }
    }
}
