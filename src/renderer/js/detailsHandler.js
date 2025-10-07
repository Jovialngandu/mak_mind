import { formatClipDate } from './clipRenderer.js'; 

const detailsContent = document.querySelector('.details-content'); 

// 📢 SÉLECTEURS CORRIGÉS ET PRÉCIS
const copyButton = detailsContent ? detailsContent.querySelector('.copy-btn') : null;
// Le bouton Supprimer est le deuxième enfant du conteneur .action-buttons
const deleteButton = detailsContent ? detailsContent.querySelector('.action-buttons button:nth-child(2)') : null;
// Le bouton Exporter est le troisième, à des fins de vérification
// const exportButton = detailsContent ? detailsContent.querySelector('.action-buttons button:nth-child(3)') : null;


/**
 * Met à jour la vue de contenu principal avec les détails du clip.
 * @param {Clip | null} clip - Le clip sélectionné.
 */
export function updateDetailsView(clip) {
    const fullTextPre = document.getElementById('clip-full-text');
    const detailSource = detailsContent ? detailsContent.querySelector('.detail-source') : null;
    const detailDate = detailsContent ? detailsContent.querySelector('.detail-date') : null;
    const actionButtons = detailsContent ? detailsContent.querySelector('.action-buttons') : null; 

    if (!fullTextPre || !detailSource || !detailDate || !actionButtons) {
        console.error("Éléments de la vue de détail manquants.");
        return;
    }

    if (!clip) {
        fullTextPre.textContent = "Sélectionnez un clip dans l'historique pour afficher son contenu complet.";
        detailSource.innerHTML = '<i class="fas fa-desktop"></i> Source: N/A';
        detailDate.innerHTML = '<i class="far fa-calendar-alt"></i> Date: N/A';
        
        actionButtons.style.display = 'none';
        return;
    }
    
    const dates = formatClipDate(clip.created_at);

    fullTextPre.textContent = clip.content;
    detailSource.innerHTML = `<i class="fas fa-desktop"></i> Source: ${clip.source || 'Système'}`;
    detailDate.innerHTML = `<i class="far fa-calendar-alt"></i> ${dates.fullDate}`;
    
    // Afficher les boutons
    actionButtons.style.display = 'flex';
    
    // Mettre à jour les attributs de données pour les actions
    if (copyButton) copyButton.setAttribute('data-clip-content', clip.content);
    
    // Stocker l'ID du clip pour la suppression
    if (deleteButton) deleteButton.setAttribute('data-clip-id', clip.id); 
}

/**
 * Configure le gestionnaire d'événement pour le bouton de copie.
 */
export function setupCopyAction() {
    if (!copyButton) {
        console.warn("Bouton de copie introuvable.");
        return;
    }

    copyButton.addEventListener('click', async function() {
        const contentToCopy = this.getAttribute('data-clip-content');
        if (contentToCopy) {
            // Utilisation de l'API Electron exposée par preload
            const result = await window.clipboardAPI.copyText(contentToCopy);
            if (result.success) {
                // Rétroaction visuelle
                this.classList.add('copied');
                this.innerHTML = '<i class="fas fa-check"></i> Copié!';
                setTimeout(() => {
                    this.classList.remove('copied');
                    this.innerHTML = '<i class="far fa-copy"></i> Copier';
                }, 1500);
            } else {
                 console.error("Échec de la copie:", result.error);
            }
        }
    });
}

/**
 * Configure le gestionnaire d'événement pour le bouton de suppression.
 */
export function setupDeleteAction() {
    if (!deleteButton) {
        console.warn("Bouton de suppression introuvable.");
        return;
    }

    deleteButton.addEventListener('click', async function() {
        const clipIdAttr = this.getAttribute('data-clip-id');
        const clipId = parseInt(clipIdAttr);

        if (!clipId || isNaN(clipId)) {
            // Pas de clip sélectionné ou ID invalide
            return;
        }
        
        // Utilisation de la fonction native confirm (à remplacer par une modale custom si l'on voulait éviter les alertes natives)
        if (confirm(`Êtes-vous sûr de vouloir supprimer ce clip ?`)) {

            //`Êtes-vous sûr de vouloir supprimer ce clip (ID: ${clipId})?`
            
            // Appel IPC vers le Main Process pour la suppression
            const result = await window.clipboardAPI.deleteClip(clipId);
            
            if (result.success) {
                // L'UI sera mise à jour par l'événement IPC 'clip-deleted' reçu dans index.js
                //console.log(`Suppression du Clip ${clipId} initiée. Confirmation par l'Emitter attendue.`);
            } else {
                 alert(`Erreur: ${result.message || "La suppression a échoué."}`);
            }
        }
    });
}
