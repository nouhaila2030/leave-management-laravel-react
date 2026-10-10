<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // Assurez-vous que cette ligne est correcte
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // ✅ Désactiver CSRF pour les routes API
        $middleware->validateCsrfTokens(except: [
            'api/*'
        ]);

        // ✅ Configuration API avec Sanctum
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class, // Doit être ici
        ]);

        // ✅ Ajouter CORS pour les API
        $middleware->api(append: [
            \App\Http\Middleware\CorsMiddleware::class,
        ]);

        // ✅ Middleware personnalisés
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'cors' => \App\Http\Middleware\CorsMiddleware::class,
        ]);

        // ✅ CONFIGURATION SANCTUM POUR L'AUTHENTIFICATION
        $middleware->statefulApi(); // Doit être présent
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
