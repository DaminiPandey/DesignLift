<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SocialLoginController extends Controller
{
    public function redirectToProvider()
    {
        return Socialite::driver('github')
            ->scopes(['repo', 'user:email', 'read:user'])
            ->redirect();
    }

    public function handleProviderCallback()
    {
        try {
            $socialUser = Socialite::driver('github')->user();
            
            Log::info('GitHub OAuth successful', [
                'email' => $socialUser->getEmail(),
                'username' => $socialUser->getNickname()
            ]);

            $user = User::updateOrCreate(
                ['email' => $socialUser->getEmail()],
                [
                    'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                    'password' => bcrypt(str()->random(16)),
                    'email_verified_at' => now(),
                    'github_username' => $socialUser->getNickname(),
                    'github_token' => $socialUser->token
                ]
            );

            Auth::login($user);
            
            return redirect()->route('dashboard');
            
        } catch (\Exception $e) {
            Log::error('GitHub OAuth failed', [
                'error' => $e->getMessage()
            ]);
            
            return redirect()->route('login')
                ->with('error', 'Failed to authenticate with GitHub. Please try again.');
        }
    }

    public function refreshToken()
    {
        return redirect()->route('login.github')
            ->with('message', 'Please re-authenticate with GitHub to refresh your token.');
    }
}
