// src/renderer/index.js (Nouveau point d'entrée minimaliste)
import { setupNavigation, setupThemeToggle } from './js/navigation.js';
import { loadInitialClips, setupSearch ,prependClip} from './js/clipRenderer.js';
import { setupCopyAction } from './js/detailsHandler.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des modules
    // 1. Navigation et Thème
    setupNavigation();
    setupThemeToggle();
    
    // 2. Logique d'affichage et d'interaction
    setupSearch();
    setupCopyAction();
    
    // 3. Chargement initial des données
    loadInitialClips();


    window.clipboardAPI.onClipAdded((newClip) => {
        const searchInput = document.getElementById('search-input');
        const currentQuery = searchInput ? searchInput.value.trim() : '';

        // N'insérer le clip que si l'utilisateur n'est pas en train d'effectuer une recherche.
        // Sinon, le clip sera manquant jusqu'à ce que la recherche soit effacée.
        if (currentQuery.length === 0) {
            prependClip(newClip);
        }
    });

});


