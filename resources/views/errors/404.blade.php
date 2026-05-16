<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Page Introuvable — LoméShop</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #FDF8F4; }
        .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); }
    </style>
</head>
<body class="h-screen flex items-center justify-center p-6 overflow-hidden">
    <div class="max-w-md w-full text-center">
        <div class="relative mb-12">
            <h1 class="text-[180px] font-black text-[#8B4513]/10 leading-none select-none">404</h1>
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-32 h-32 bg-[#8B4513] rounded-full flex items-center justify-center shadow-2xl shadow-[#8B4513]/40 animate-bounce">
                    <span class="text-6xl">🛵</span>
                </div>
            </div>
        </div>
        
        <h2 class="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Oups ! On dirait que vous êtes perdu.</h2>
        <p class="text-gray-500 font-medium mb-10 leading-relaxed">La page que vous recherchez n'existe pas ou a été déplacée. Même nos meilleurs livreurs ne l'ont pas trouvée !</p>
        
        <div class="flex flex-col gap-4">
            <a href="/" class="bg-[#8B4513] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-[#8B4513]/20 hover:scale-105 transition-all">
                Retourner à l'accueil
            </a>
            <button onclick="history.back()" class="bg-white text-gray-400 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:text-gray-900 transition-all">
                Page précédente
            </button>
        </div>
        
        <div class="mt-20">
            <p class="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">LoméShop Prestige Edition</p>
        </div>
    </div>
</body>
</html>
