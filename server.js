const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const videosDir = path.join(__dirname, 'public', 'videos');
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, videosDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// Base de datos temporal con soporte para comentarios
let db = [
    { 
        id: "1700000000000", 
        title: "Video de Bienvenida", 
        file: "", 
        thumb: "https://picsum.photos/seed/wa1/320/180",
        comments: ["¡Increíble plataforma!", "WAYouT es el futuro."]
    }
];

app.use(express.static('public'));
app.use(express.json());

// API: Obtener todos los videos
app.get('/api/videos', (req, res) => res.json(db));

// API: Subir video
app.post('/upload', upload.single('videoFile'), (req, res) => {
    if (req.file) {
        db.push({
            id: Date.now().toString(),
            title: req.body.videoTitle || "Sin título",
            file: req.file.filename,
            thumb: `https://picsum.photos/seed/${Date.now()}/320/180`,
            comments: []
        });
    }
    res.redirect('/');
});

// API: Agregar comentario
app.post('/api/comments', (req, res) => {
    const { videoId, text } = req.body;
    const video = db.find(v => v.id === videoId);
    if (video && text) {
        video.comments.push(text);
        res.json({ success: true, comments: video.comments });
    } else {
        res.status(404).json({ error: "Video no encontrado" });
    }
});

app.listen(PORT, () => console.log(`WAYouT corriendo en http://localhost:${PORT}`));
