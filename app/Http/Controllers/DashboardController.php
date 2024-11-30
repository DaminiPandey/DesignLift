<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function show()
    {
        // $user = auth()->user();
        $user = Auth::user();

        $client = new \GuzzleHttp\Client();
        $response = $client->get('https://api.github.com/user/repos', [
            'headers' => [
                'Authorization' => 'token ' . $user->github_token,
            ],
        ]);
        $repositories = json_decode($response->getBody(), true);
        dd($repositories);
        return Inertia::render('Dashboard/Index', []);
    }
}
