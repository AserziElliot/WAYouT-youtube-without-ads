const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// --- BASE DE DATOS INTERNA ---
// Importante: El nombre en 'file' debe ser EXACTO al que subiste a public/videos/
const wayoutDB = [
    { 
        id: "1", 
        title: "IAs jugando al Fuchibol", 
        author: "Test account 1",
        file: "videoplayback (20).mp4", 
        thumb: "https://picsum.photos/seed/wayout1/320/180" 
    }
];

// Servir archivos de la carpeta public (donde están tus videos)
app.use(express.static('public'));

// API interna para enviar los datos al frontend
app.get('/api/videos', (req, res) => res.json(wayoutDB));

// --- INTERFAZ HTML INTEGRADA ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WAYouT - Sin Anuncios</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
            body { background-color: #0f0f0f; color: white; font-family: sans-serif; }
            .v-card:hover img { border-radius: 0; transition: 0.3s; }
        </style>
    </head>
    <body>
        <nav class="flex justify-between items-center p-4 sticky top-0 bg-[#0f0f0f] z-50 border-b border-zinc-800">
            <div class="flex items-center gap-2">
                <i class="fa-solid fa-play-circle text-red-600 text-3xl"></i>
                <span class="font-bold text-xl tracking-tighter">WAYouT</span>
            </div>
            <div class="hidden md:block w-1/3 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-1 text-zinc-500 text-sm">
                Buscar en base de datos local...
            </div>
            <div class="w-8 h-8 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full"></div>
        </nav>

        <main class="p-6">
            <div id="playerSection" class="hidden max-w-5xl mx-auto mb-10">
                <video id="videoElement" controls class="w-full rounded-xl shadow-2xl bg-black border border-zinc-800"></video>
                <h1 id="playingTitle" class="text-2xl font-bold mt-4"></h1>
                <p class="text-zinc-400 text-sm mt-1">Servido desde Render • Sin rastreadores</p>
                <hr class="border-zinc-800 my-4">
            </div>

            <h2 class="text-lg font-bold mb-6">Videos Disponibles</h2>
            <div id="videoGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                </div>
        </main>

        <script>
            async function loadVideos() {
                const response = await fetch('/api/videos');
                const videos = await response.json();
                const grid = document.getElementById('videoGrid');
                
                grid.innerHTML = videos.map(v => \`
                    <div onclick="playVideo('\${v.file}', '\${v.title}')" class="v-card cursor-pointer group">
                        <img src="\${v.thumb}" class="rounded-xl w-full aspect-video object-cover">
                        <div class="mt-3 flex gap-3">
                            <div class="w-9 h-9 bg-zinc-800 rounded-full flex-shrink-0"></div>
                            <div>
                                <h3 class="font-semibold text-sm line-clamp-2">\${v.title}</h3>
                                <p class="text-zinc-400 text-xs mt-1">\${v.author}</p>
                            </div>
                        </div>
                    </div>
                \`).join('');
            }

            function playVideo(file, title) {
                const section = document.getElementById('playerSection');
                const video = document.getElementById('videoElement');
                const titleEl = document.getElementById('playingTitle');
                
                titleEl.innerText = title;
                video.src = '/videos/' + file;
                section.classList.remove('hidden');
                video.play();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            loadVideos();
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => console.log('Servidor WAYouT activo en puerto ' + PORT));
