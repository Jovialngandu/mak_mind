// src/renderer/index.js (Nouveau point d'entrée minimaliste)
import { setupNavigation, setupThemeToggle } from './js/navigation.js';
import { loadInitialClips, setupSearch } from './js/clipRenderer.js';
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
});