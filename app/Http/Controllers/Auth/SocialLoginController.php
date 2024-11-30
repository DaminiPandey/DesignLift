<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class SocialLoginController extends Controller
{
    public function redirectToProvider()
    {
        return Socialite::driver('github')
            ->scopes(['repo', 'user:email'])
            ->redirect();
    }

    public function handleProviderCallback()
    {
        $provider = 'github';
        $socialUser = Socialite::driver('github')->user();
        $user = User::firstOrCreate(
            ['email' => $socialUser->getEmail()],
            [
                'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                'password' => bcrypt(str()->random(16)), // Random password
                'email_verified_at' => now(),
                // 'github_username' => $provider === 'github' ? $socialUser->getNickname() : null,
                'github_token' => $socialUser->token,
            ]
        );
        Auth::login($user);

        return redirect()->route('dashboard'); // Redirect to your desired route
    }
}
