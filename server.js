const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// S'assurer que le dossier de stockage MP3 existe
const uploadDir = path.join(__dirname, 'uploads/music');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuration du stockage des MP3 sur le disque
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // Limite stricte : 15 Mo par fichier MP3
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers MP3 sont autorisés.'));
        }
    }
});

// Base de données temporaire en mémoire pour les chansons
let catalogueChansons = [
    {
        id: 1,
        titre: "Lubumbashi Vibez",
        artiste: "Artiste Katanga",
        genre: "Afrobeat",
        url: "/uploads/music/demo.mp3",
        date: new Date().toLocaleDateString('fr-FR')
    }
];

// Routes de l'API

// 1. Obtenir la liste de toutes les chansons
app.get('/api/chansons', (req, res) => {
    res.json(catalogueChansons);
});

// 2. Publier un nouveau morceau (1 000 FC)
app.post('/api/upload', upload.single('fichier_mp3'), (req, res) => {
    try {
        const { artiste, titre, genre, telephone, email } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "Aucun fichier MP3 n'a été reçu." });
        }

        const nouvelleChanson = {
            id: catalogueChansons.length + 1,
            titre: titre,
            artiste: artiste,
            genre: genre,
            email: email,
            telephone: telephone,
            url: `/uploads/music/${req.file.filename}`,
            date: new Date().toLocaleDateString('fr-FR')
        };

        catalogueChansons.unshift(nouvelleChanson);

        console.log(`[RIVERS_- OTH] Nouveau morceau publié : ${titre} par ${artiste}. Paiement Mobile Money attendu au 0982956876.`);

        res.status(201).json({
            success: true,
            message: "Morceau téléversé avec succès ! Validation du paiement de 1 000 FC en cours.",
            chanson: nouvelleChanson
        });
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur lors de la publication : " + err.message });
    }
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` Serveur RIVERS_- OTH démarré avec succès !`);
    console.log(` Accès local : http://localhost:${PORT}`);
    console.log(`==================================================`);
});