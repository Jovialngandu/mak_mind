// src/renderer/detailsHandler.js
import { formatClipDate } from './clipRenderer.js';

const detailsContent = document.querySelector('.details-content');
const copyButton = detailsContent.querySelector('.copy-btn');


/**
 * Met à jour la vue de contenu principal avec les détails du clip.
 * @param {Clip | null} clip - Le clip sélectionné.
 */
export function updateDetailsView(clip) {
    const fullTextPre = document.getElementById('clip-full-text');
    const detailSource = detailsContent.querySelector('.detail-source');
    const detailDate = detailsContent.querySelector('.detail-date');

    if (!clip) {
        fullTextPre.textContent = "Sélectionnez un clip dans l'historique pour afficher son contenu complet.";
        detailSource.innerHTML = '<i class="fas fa-desktop"></i> Source: N/A';
        detailDate.innerHTML = '<i class="far fa-calendar-alt"></i> Date: N/A';
        copyButton.style.display = 'none';
        return;
    }
    
    const dates = formatClipDate(clip.created_at);

    fullTextPre.textContent = clip.content;
    detailSource.innerHTML = `<i class="fas fa-desktop"></i> Source: ${clip.source || 'Système'}`;
    detailDate.innerHTML = `<i class="far fa-calendar-alt"></i> ${dates.fullDate}`;
    copyButton.style.display = 'inline-flex';
    copyButton.setAttribute('data-clip-content', clip.content);
}

/**
 * Configure le gestionnaire d'événement pour le bouton de copie.
 */
export function setupCopyAction() {
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