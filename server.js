const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de carpetas
const videosDir = path.join(__dirname, 'public', 'videos');
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, videosDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

let db = []; // Base de datos temporal

app.use(express.static('public'));
app.use(express.json());

// Ruta para obtener videos
app.get('/api/videos', (req, res) => res.json(db));

// Ruta para subir videos
app.post('/upload', upload.single('videoFile'), (req, res) => {
    if (req.file) {
        db.push({
            id: Date.now(),
            title: req.body.videoTitle || "Nuevo Video",
            file: req.file.filename,
            thumb: `https://picsum.photos/seed/${Date.now()}/320/180`
        });
    }
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
