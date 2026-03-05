const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

// --- 1. BASE DE DATOS INTERNA DE WAYOUT ---
// Aquí es donde guardas tus videos. No hay enlaces a YouTube.
// Los archivos deben estar físicamente en tu carpeta /public/videos/
const wayoutDB = [
    {
        id: "1",
        title: "Bienvenida a WAYouT",
        author: "Admin",
        views: "1.2k",
        filename: "bienvenida.mp4",
        thumbnail: "https://picsum.photos/seed/wa1/320/180"
    },
    {
        id: "2",
        title: "Video de Prueba sin Anuncios",
        author: "Comunidad",
        views: "850",
        filename: "test.mp4",
        thumbnail: "https://picsum.photos/seed/wa2/320/180"
    }
];

// --- 2. CONFIGURACIÓN DEL SERVIDOR ---
app.use(express.static('public')); // Carpeta para videos y fotos

// Ruta para obtener los datos (API)
app.get('/api/videos', (req, res) => {
    res.json(wayoutDB);
});

// Ruta principal que genera el HTML dinámicamente
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WAYouT - Database Mode</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
            body { background-color: #0f0f0f; color: white; }
            .video-card:hover { transform: scale(1.02); transition: 0.2s; }
        </style>
    </head>
    <body>
        <nav class="flex justify-between items-center p-4 sticky top-0 bg-[#0f0f0f] border-b border-zinc-800 z-50">
            <div class="flex items-center gap-2">
                <i class="fa-brands fa-youtube text-red-600 text-3xl"></i>
                <span class="font-bold text-xl uppercase tracking-tighter">WAYouT</span>
            </div>
            <div class="bg-zinc-800 px-4 py-2 rounded-full w-1/3 text-zinc-400 text-sm">
                Buscar en Base de Datos Render...
            </div>
            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs">U</div>
        </nav>

        <main class="p-6">
            <div id="playerSection" class="hidden max-w-5xl mx-auto mb-10">
                <video id="mainVideo" controls class="w-full rounded-xl shadow-2xl border border-zinc-700 bg-black"></video>
                <h1 id="vTitle" class="text-2xl font-bold mt-4"></h1>
                <p class="text-zinc-400">Reproduciendo desde almacenamiento WAYouT (Sin Anuncios)</p>
            </div>

            <h2 class="text-lg font-bold mb-4">Base de Datos Local</h2>
            <div id="grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                </div>
        </main>

        <script>
            async function init() {
                const res = await fetch('/api/videos');
                const videos = await res.json();
                const grid = document.getElementById('grid');

                grid.innerHTML = videos.map(v => \`
                    <div onclick="playVideo('\${v.filename}', '\${v.title}')" class="video-card cursor-pointer">
                        <img src="\${v.thumbnail}" class="rounded-xl w-full mb-2">
                        <div class="flex gap-3">
                            <div class="w-9 h-9 bg-zinc-700 rounded-full shrink-0"></div>
                            <div>
                                <h3 class="font-semibold text-sm line-clamp-2">\${v.title}</h3>
                                <p class="text-zinc-400 text-xs mt-1">\${v.author}</p>
                                <p class="text-zinc-400 text-xs">\${v.views} vistas</p>
                            </div>
                        </div>
                    </div>
                \`).join('');
            }

            function playVideo(file, title) {
                const section = document.getElementById('playerSection');
                const video = document.getElementById('mainVideo');
                document.getElementById('vTitle').innerText = title;
                
                video.src = '/videos/' + file;
                section.classList.remove('hidden');
                video.play();
                window.scrollTo({top: 0, behavior: 'smooth'});
            }

            init();
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log('WAYouT listo en puerto ' + PORT);
});
