import { updateDetailsView, setupCopyAction } from './detailsHandler.js';

const clipList = document.querySelector('.clip-list');
const searchInput = document.getElementById('search-input'); // Référence au champ de recherche dans history-view.html

/** * Échappe les caractères spéciaux HTML pour prévenir les failles XSS.
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
 * @param {string} isoDate - La date ISO ou timestamp.
 */
export function formatClipDate(isoDate) {
    const d = new Date(isoDate);
    // Gérer le cas de date invalide
    if (isNaN(d.getTime())) return { time: 'N/A', date: 'N/A', fullDate: 'Date Invalide' };
    
    return {
        time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
        fullDate: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) + ', ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
}

/**
 * Crée un élément de liste HTML pour un clip. (Fonction de rendu)
 * @param {Object} clip - L'objet clip contenant id, content, source, created_at.
 */
function createClipItem(clip) {
    const item = document.createElement('div');
    item.classList.add('clip-item');
    // Le stockage des données dans l'élément est maintenu pour la sélection rapide
    item.setAttribute('data-id', clip.id); 
    // item.setAttribute('data-content', clip.content); // Inutile si on passe l'objet au click
    // item.setAttribute('data-source', clip.source || 'Inconnu');
    // item.setAttribute('data-date', clip.created_at);
    
    const dates = formatClipDate(clip.created_at);
    
    // Appliquez escapeHtml() au contenu du clip avant l'insertion !
    const previewContent = escapeHtml(clip.content); 

    item.innerHTML = `
        <div class="clip-text-preview">${previewContent.substring(0, 50).replace(/\n/g, ' ') + '...'}</div>
        <div class="clip-meta">
            <span class="clip-time">${dates.time} - ${dates.date}</span>
            <span class="clip-source"><i class="fas fa-desktop"></i> ${clip.source || 'Système'}</span>
        </div>
    `;
    
    // Ajout de l'écouteur de clic ici pour l'utiliser dans renderClips et prependClip
    item.addEventListener('click', function() {
        document.querySelectorAll('.clip-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        updateDetailsView(clip);
    });
    
    return item;
}



/**
 * Affiche l'historique des clips dans la liste. (Logique principale de rendu)
 * @param {Clip[]} clips
 */
export function renderClips(clips) {
    clipList.innerHTML = ''; 
    
    // Afficher le message 'Aucun clip trouvé' si la liste est vide
    if (clips.length === 0) {
        clipList.innerHTML = '<div id="no-clips-message" style="text-align: center; padding: 20px; color: var(--text-secondary);">Aucun clip trouvé.</div>';
        updateDetailsView(null);
        return;
    }

    // Créer et ajouter tous les éléments
    clips.forEach(clip => {
        const item = createClipItem(clip);
        clipList.appendChild(item);
    });

    // Sélectionner le premier élément pour afficher les détails
    const firstItem = clipList.querySelector('.clip-item');
    if (firstItem) {
         firstItem.click(); // Déclenche l'affichage des détails
    }
}


/**
 * Insère un nouveau clip en haut de la liste sans perturber le défilement actuel.
 * @param {Clip} newClip - L'objet clip complet.
 */
export function prependClip(newClip) {
    // 1. Créer le nouvel élément HTML (avec son écouteur de clic intégré)
    const newItem = createClipItem(newClip);

    // 2. Supprimer le message 'Aucun clip trouvé' si présent
    const noClipsMsg = document.getElementById('no-clips-message');
    if (noClipsMsg) noClipsMsg.remove();

    // 3. Insérer l'élément en haut de la liste
    clipList.insertBefore(newItem, clipList.firstChild);
}

/**
 * Supprime visuellement un clip de la liste (utilisé par IPC 'clip-deleted').
 * @param {number} clipId - L'ID du clip à supprimer.
 */
export function removeClipFromList(clipId) {
    const itemToRemove = document.querySelector(`.clip-item[data-id="${clipId}"]`);

    if (itemToRemove) {
        const wasActive = itemToRemove.classList.contains('active');
        // Tentative de sélectionner le clip suivant ou précédent
        const nextItem = itemToRemove.nextElementSibling || itemToRemove.previousElementSibling;
        
        itemToRemove.remove(); // Suppression de l'élément HTML

        if (wasActive) {
            if (nextItem && nextItem.classList.contains('clip-item')) {
                nextItem.click(); // Sélectionne le clip voisin
            } else {
                // Réinitialiser la vue détaillée
                updateDetailsView(null); 
                
                // Afficher le message "Aucun clip" si la liste est vide
                if (clipList.children.length === 0) {
                    clipList.innerHTML = '<div id="no-clips-message" style="text-align: center; padding: 20px; color: var(--text-secondary);">Aucun clip trouvé.</div>';
                }
            }
        }
    }
}


/**
 * Initialise la recherche en fonction de l'entrée utilisateur.
 */
export function setupSearch() {
    if (!searchInput) {
        console.warn("Champ de recherche (search-input) introuvable. La recherche ne sera pas configurée.");
        return;
    }
    
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const query = searchInput.value.trim();
            let clips;
            
            try {
                if (query.length > 0) {
                     clips = await window.clipboardAPI.searchClips(query);
                } else {
                     // Si la recherche est vide, on recharge l'historique récent
                     clips = await window.clipboardAPI.getRecentClips(50);
                }
                renderClips(clips);
            } catch (error) {
                console.error("Erreur lors de la recherche IPC:", error);
                clipList.innerHTML = '<div style="color: red; padding: 20px;">Erreur de recherche.</div>';
            }
        }, 300);
    });
}

/**
 * Fonction de chargement initial et de rafraîchissement.
 */
export async function loadInitialClips() {
    clipList.innerHTML = '<div style="text-align: center; padding: 20px;">Chargement...</div>';
    try {
        // Assurez-vous que window.clipboardAPI est disponible (via preload)
        const initialClips = await window.clipboardAPI.getRecentClips(50);
        renderClips(initialClips);
    } catch (error) {
        console.error('Erreur lors du chargement initial des clips:', error);
        clipList.innerHTML = '<div style="color: red; padding: 20px;">Erreur de chargement initial.</div>';
        updateDetailsView(null);
    }
}