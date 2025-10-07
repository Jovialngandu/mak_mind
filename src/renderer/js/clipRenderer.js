import { updateDetailsView, setupCopyAction } from './detailsHandler.js';

const clipList = document.querySelector('.clip-list');
const searchInput = document.getElementById('search-input');

/** 
* @param {string} str - La chaîne de caractères à échapper.
 * @returns {string} La chaîne échappée.
 */

function escapeHtml(str) {
    if (typeof str !== 'string') return ''; // Gérer les cas où ce n'est pas une chaîne
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

/**
 * Formate la date pour l'affichage. (Fonction Utilitaire)
 */
export function formatClipDate(isoDate) {
    const d = new Date(isoDate);
    return {
        time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
        fullDate: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) + ', ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
}

/**
 * Crée un élément de liste HTML pour un clip. (Fonction de rendu)
 */
function createClipItem(clip) {
    const item = document.createElement('div');
    item.classList.add('clip-item');
    // Le stockage des données dans l'élément est maintenu pour la sélection rapide
    item.setAttribute('data-id', clip.id); 
    item.setAttribute('data-content', clip.content); 
    item.setAttribute('data-source', clip.source || 'Inconnu');
    item.setAttribute('data-date', clip.created_at);
    
    const dates = formatClipDate(clip.created_at);
    
    // 📢 CORRECTION : Appliquez escapeHtml() au contenu du clip avant l'insertion !
    const previewContent = escapeHtml(clip.content); 

    item.innerHTML = `
        <div class="clip-text-preview">${previewContent.substring(0, 50).replace(/\n/g, ' ') + '...'}</div>
        <div class="clip-meta">
            <span class="clip-time">${dates.time} - ${dates.date}</span>
            <span class="clip-source"><i class="fas fa-desktop"></i> ${clip.source || 'Système'}</span>
        </div>
    `;
    
    return item;
}



/**
 * Affiche l'historique des clips dans la liste. (Logique principale de rendu)
 * @param {Clip[]} clips
 */
export function renderClips(clips) {
    clipList.innerHTML = ''; 
    if (clips.length === 0) {
        clipList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Aucun clip trouvé.</div>';
        updateDetailsView(null);
        return;
    }

    clips.forEach(clip => {
        const item = createClipItem(clip);
        clipList.appendChild(item);

        item.addEventListener('click', function() {
            document.querySelectorAll('.clip-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            updateDetailsView(clip);
        });
    });

    // Simuler le clic sur le premier élément pour afficher les détails
    const firstItem = clipList.querySelector('.clip-item');
    if (firstItem) {
         firstItem.click(); 
    }
}


/**
 * Insère un nouveau clip en haut de la liste sans perturber le défilement actuel.
 * @param {Clip} newClip - L'objet clip complet.
 */
export function prependClip(newClip) {
    // 1. Créer le nouvel élément HTML
    const newItem = createClipItem(newClip);

    // 2. Insérer l'élément en haut de la liste
    if (clipList.firstChild) {
        // Supprime le message 'Aucun clip trouvé' si présent, puis insère
        if (clipList.firstChild.id === 'no-clips-message') {
             clipList.innerHTML = ''; // Nettoyer le message d'absence de clip
        }
        clipList.insertBefore(newItem, clipList.firstChild);
    } else {
        // La liste était vide
        clipList.appendChild(newItem);
    }
    
    // 3. Ajouter l'écouteur de clic
    newItem.addEventListener('click', function() {
        // Logic de sélection
        document.querySelectorAll('.clip-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        updateDetailsView(newClip);
    });

    // 4. Mettre en surbrillance le nouvel élément (optionnel)
    // newItem.classList.add('active');
    // updateDetailsView(newClip);
    
    // 💡 IMPORTANT : Nous évitons de faire défiler ou de changer la sélection 
    // pour ne pas interrompre l'utilisateur s'il est en train de regarder d'anciens clips.
}
/**
 * Initialise la recherche en fonction de l'entrée utilisateur.
 */
export function setupSearch() {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const query = searchInput.value.trim();
            let clips;
            // Assurez-vous que window.clipboardAPI est disponible (via preload)
            if (query.length > 0) {
                 clips = await window.clipboardAPI.searchClips(query);
            } else {
                 clips = await window.clipboardAPI.getRecentClips(50);
            }
            renderClips(clips);
        }, 300);
    });
}

/**
 * Fonction de chargement initial et de rafraîchissement.
 */
export async function loadInitialClips() {
    // Assurez-vous que window.clipboardAPI est disponible (via preload)
    const initialClips = await window.clipboardAPI.getRecentClips(50);
    renderClips(initialClips);
}