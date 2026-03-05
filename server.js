const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Asegurar que las carpetas existen
const uploadDir = path.join(__dirname, 'public/videos');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// "Base de datos" en memoria (se reinicia con el servidor)
let wayoutDB = [
    { id: 1, title: "Video Inicial", file: "test.mp4", thumb: "https://picsum.photos/seed/way1/320/180" }
];

app.use(express.static('public'));
app.use(express.json());

// API para obtener videos
app.get('/api/videos', (req, res) => res.json(wayoutDB));

// RUTA PARA SUBIR VIDEOS
app.post('/upload', upload.single('video'), (req, res) => {
    const newVideo = {
        id: wayoutDB.length + 1,
        title: req.body.title || "Video sin título",
        file: req.file.filename,
        thumb: "https://picsum.photos/seed/" + Math.random() + "/320/180"
    };
    wayoutDB.push(newVideo);
    res.redirect('/');
});

// INTERFAZ HTML
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>WAYouT - Subir Video</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#0f0f0f] text-white p-6">
        <nav class="flex justify-between items-center mb-10">
            <h1 class="text-red-600 text-3xl font-bold italic">WAYouT</h1>
            <button onclick="document.getElementById('modal').classList.toggle('hidden')" class="bg-red-600 px-4 py-2 rounded-full font-bold hover:bg-red-700 transition">
                + Subir Video
            </button>
        </nav>

        <div id="modal" class="hidden fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div class="bg-zinc-900 p-8 rounded-2xl border border-zinc-700 max-w-md w-full">
                <h2 class="text-xl font-bold mb-4">Añadir nuevo video</h2>
                <form action="/upload" method="POST" enctype="multipart/form-data" class="flex flex-col gap-4">
                    <input type="text" name="title" placeholder="Título del video" class="bg-zinc-800 p-3 rounded-lg outline-none border border-zinc-700 focus:border-red-500" required>
                    <input type="file" name="video" accept="video/*" class="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-zinc-700 file:text-white hover:file:bg-zinc-600" required>
                    <div class="flex gap-2 mt-4">
                        <button type="submit" class="flex-1 bg-white text-black font-bold py-2 rounded-lg">Publicar</button>
                        <button type="button" onclick="document.getElementById('modal').classList.add('hidden')" class="flex-1 bg-zinc-800 py-2 rounded-lg">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="player" class="hidden max-w-4xl mx-auto mb-12">
            <video id="v" controls class="w-full rounded-xl bg-black border border-zinc-800 shadow-2xl"></video>
            <h2 id="t" class="text-2xl font-bold mt-4"></h2>
        </div>

        <div id="grid" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>

        <script>
            async function load() {
                const res = await fetch('/api/videos');
                const videos = await res.json();
                document.getElementById('grid').innerHTML = videos.map(v => \`
                    <div onclick="play('\${v.file}', '\${v.title}')" class="cursor-pointer group">
                        <div class="relative overflow-hidden rounded-xl">
                            <img src="\${v.thumb}" class="w-full aspect-video object-cover group-hover:scale-105 transition duration-300">
                        </div>
                        <h3 class="font-bold mt-2 text-sm line-clamp-2">\${v.title}</h3>
                    </div>\`).join('');
            }

            function play(file, title) {
                const p = document.getElementById('player');
                const v = document.getElementById('v');
                document.getElementById('t').innerText = title;
                v.src = '/videos/' + file;
                p.classList.remove('hidden');
                v.play();
                window.scrollTo({top: 0, behavior: 'smooth'});
            }
            load();
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => console.log('WAYouT con subidas activo'));
