const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Crear carpetas automáticamente para que no falle Render
const vDir = path.join(__dirname, 'public', 'videos');
if (!fs.existsSync(vDir)) fs.mkdirSync(vDir, { recursive: true });

// 2. Configurar Multer para recibir videos
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, vDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// 3. Base de datos temporal (se guarda mientras el servidor esté encendido)
let videosDB = [
    { id: 1, title: "Video Inicial", file: "test.mp4", thumb: "https://picsum.photos/seed/wa1/320/180" }
];

app.use(express.static('public'));
app.use(express.json());

app.get('/api/videos', (req, res) => res.json(videosDB));

// 4. Ruta para procesar la subida desde el formulario
app.post('/upload', upload.single('videoFile'), (req, res) => {
    if (req.file) {
        videosDB.push({
            id: Date.now(),
            title: req.body.videoTitle || "Nuevo Video",
            file: req.file.filename,
            thumb: "https://picsum.photos/seed/" + Date.now() + "/320/180"
        });
    }
    res.redirect('/');
});

// 5. Interfaz con Formulario
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>WAYouT - Subir Video</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#0f0f0f] text-white font-sans p-6">
        <nav class="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
            <h1 class="text-red-600 text-3xl font-bold">WAYouT</h1>
            <button onclick="document.getElementById('uploadBox').classList.toggle('hidden')" class="bg-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-700">＋ SUBIR</button>
        </nav>

        <div id="uploadBox" class="hidden bg-zinc-900 p-6 rounded-xl border border-zinc-700 mb-10 max-w-xl mx-auto">
            <form action="/upload" method="POST" enctype="multipart/form-data" class="flex flex-col gap-4">
                <input type="text" name="videoTitle" placeholder="Título del video" class="bg-zinc-800 p-3 rounded outline-none border border-zinc-700" required>
                <input type="file" name="videoFile" accept="video/*" class="text-sm" required>
                <button type="submit" class="bg-white text-black font-bold py-3 rounded hover:bg-zinc-200">PUBLICAR AHORA</button>
            </form>
        </div>

        <div id="player" class="hidden max-w-4xl mx-auto mb-10">
            <video id="v" controls class="w-full rounded-xl bg-black border border-zinc-800 shadow-2xl"></video>
            <h2 id="t" class="text-2xl font-bold mt-4"></h2>
        </div>

        <div id="grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"></div>

        <script>
            async function load() {
                const r = await fetch('/api/videos');
                const data = await r.json();
                document.getElementById('grid').innerHTML = data.map(v => \`
                    <div onclick="play('\${v.file}', '\${v.title}')" class="cursor-pointer group">
                        <img src="\${v.thumb}" class="rounded-xl w-full mb-2 border border-zinc-800 group-hover:border-red-600">
                        <h3 class="font-bold text-sm">\${v.title}</h3>
                    </div>\`).join('');
            }
            function play(file, title) {
                const p = document.getElementById('player');
                const v = document.getElementById('v');
                document.getElementById('t').innerText = title;
                v.src = '/videos/' + file;
                p.classList.remove('hidden');
                v.play();
                window.scrollTo({top:0, behavior:'smooth'});
            }
            load();
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => console.log('WAYouT Online con Subidas'));
