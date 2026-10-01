let catalogueLocal = [];

// 1. Changement de couleur dynamique toutes les 60 secondes
const fonds = ['#121212', '#1a0033', '#002b1f', '#330000', '#001a33'];
let indexCouleur = 0;
setInterval(() => {
    indexCouleur = (indexCouleur + 1) % fonds.length;
    document.body.style.backgroundColor = fonds[indexCouleur];
}, 60000);

// 2. Navigation entre les onglets
function switchSection(sectionId) {
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`section-${sectionId}`).classList.add('active');

    if (sectionId === 'upload') {
        document.getElementById('role-badge').innerText = 'Mode : Artiste';
    } else {
        document.getElementById('role-badge').innerText = 'Mode : Fan';
    }
}

// 3. Charger les chansons depuis le serveur Backend
async function chargerCatalogue() {
    const grid = document.getElementById('music-grid');
    try {
        const response = await fetch('/api/chansons');
        catalogueLocal = await response.json();
        afficherCatalogue(catalogueLocal);
    } catch (err) {
        grid.innerHTML = "<p style='color:red;'>Impossible de se connecter au serveur backend.</p>";
    }
}

function afficherCatalogue(liste) {
    const grid = document.getElementById('music-grid');
    grid.innerHTML = "";

    if (liste.length === 0) {
        grid.innerHTML = "<p>Aucun morceau trouvé dans le catalogue.</p>";
        return;
    }

    liste.forEach(c => {
        grid.innerHTML += `
            <div class="music-card">
                <div>
                    <strong>${echapperText(c.titre)}</strong><br>
                    <small style="color:#aaa;">Par : ${echapperText(c.artiste)}</small><br>
                    <small style="color:#ff5500;">${echapperText(c.genre)}</small>
                </div>
                <button class="btn-submit" style="margin-top:15px; padding:8px;" onclick="jouerMorceau('${echapperText(c.titre)}', '${echapperText(c.artiste)}', '${c.url}')">
                    Écouter
                </button>
            </div>
        `;
    });
}

function filtrerCatalogue() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const resultats = catalogueLocal.filter(c => 
        c.titre.toLowerCase().includes(query) || 
        c.artiste.toLowerCase().includes(query) ||
        c.genre.toLowerCase().includes(query)
    );
    afficherCatalogue(resultats);
}

function jouerMorceau(titre, artiste, url) {
    document.getElementById('player-song-title').innerText = titre;
    document.getElementById('player-artist-name').innerText = artiste;
    const player = document.getElementById('main-audio-player');
    player.src = url;
    player.play();
}

// 4. Envoi du formulaire de publication au serveur
async function soumettreMorceau(e) {
    e.preventDefault();

    const btn = document.getElementById('btn-submit-form');
    btn.disabled = true;
    btn.innerText = "Téléversement vers le serveur...";

    const formData = new FormData();
    formData.append('artiste', document.getElementById('artist-name').value);
    formData.append('titre', document.getElementById('song-title').value);
    formData.append('genre', document.getElementById('song-genre').value);
    formData.append('email', document.getElementById('artist-email').value);
    formData.append('telephone', document.getElementById('artist-phone').value);
    formData.append('fichier_mp3', document.getElementById('song-file').files[0]);

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            alert("Paiement initié ! " + data.message);
            document.getElementById('upload-form').reset();
            switchSection('catalogue');
            chargerCatalogue();
        } else {
            alert("Erreur : " + data.error);
        }
    } catch (err) {
        alert("Erreur lors de la communication avec le serveur.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Payer 1 000 FC & Envoyer le morceau";
    }
}

// 5. Chat d'assistance
function envoyerMessageChat() {
    const input = document.getElementById('chat-input');
    const windowChat = document.getElementById('chat-window');
    const msg = input.value.trim();

    if (!msg) return;

    windowChat.innerHTML += `<div class="chat-msg user">${echapperText(msg)}</div>`;
    input.value = "";

    setTimeout(() => {
        windowChat.innerHTML += `<div class="chat-msg bot">Pour valider rapidement vos 1 000 FC, assurez-vous d'avoir transféré le montant vers le 0982956876 via Mobile Money.</div>`;
        windowChat.scrollTop = windowChat.scrollHeight;
    }, 1000);

    windowChat.scrollTop = windowChat.scrollHeight;
}

function echapperText(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Démarrage
chargerCatalogue();