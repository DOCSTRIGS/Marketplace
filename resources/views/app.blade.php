<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- PWA Settings -->
        <meta name="theme-color" content="#D35400">
        <link rel="manifest" href="/manifest.json">
        <link rel="icon" href="/images/icon-192x192.png" type="image/png">
        <link rel="apple-touch-icon" href="/images/icon-192x192.png">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="LoméShop">

        <!-- PWA Service Worker Registration -->
        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                        .then(function(registration) {
                            console.log('LoméShop Service Worker registered with scope: ', registration.scope);
                        }, function(err) {
                            console.log('LoméShop Service Worker registration failed: ', err);
                        });
                });
            }
        </script>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        <script>
            if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        </script>
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        <!-- KkiaPay SDK -->
        <script src="https://cdn.kkiapay.me/k.js"></script>
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia

        {{-- Shown until React mounts into #app above (pure CSS, no JS needed):
             covers the gap between the HTML arriving and the JS bundle finishing
             download/boot/first render, which can take a few seconds on a cold
             start. Hidden automatically the instant #app gets its first child. --}}
        <div id="initial-loader">
            <div class="initial-loader-spinner"></div>
        </div>
        <style>
            #initial-loader {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #FDF8F4;
            }
            html.dark #initial-loader {
                background: #121212;
            }
            #app:not(:empty) ~ #initial-loader {
                display: none;
            }
            .initial-loader-spinner {
                width: 42px;
                height: 42px;
                border: 4px solid rgba(139, 69, 19, 0.15);
                border-top-color: #D35400;
                border-radius: 50%;
                animation: initial-loader-spin 0.8s linear infinite;
            }
            @keyframes initial-loader-spin {
                to { transform: rotate(360deg); }
            }
        </style>
    </body>
</html>
