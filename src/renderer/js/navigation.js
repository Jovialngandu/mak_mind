// src/renderer/navigation.js

// --- 1. Gestion de la Navigation (Changer de page) ---
export function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');
    const historySidebarContent = document.getElementById('history-sidebar-content');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetViewId = button.getAttribute('data-view');
            
            // Afficher/Masquer la zone de recherche/liste selon la vue
            historySidebarContent.style.display = (targetViewId === 'history' ? 'flex' : 'none');
            
            // Mise à jour de l'état 'active' des boutons et des vues
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === targetViewId + '-view') {
                    view.classList.add('active');
                }
            });
        });
    });
}


// --- 2. Gestion du Mode Sombre/Clair (Réversible) ---
const themeToggleButton = document.getElementById('theme-toggle');
const body = document.body;

// Fonction pour mettre à jour le bouton et l'état
function updateTheme(newTheme) {
    body.className = newTheme;
    localStorage.setItem('makmind-theme', newTheme);
    
    const isLight = newTheme === 'light-mode';
    const icon = isLight ? 'fas fa-moon' : 'fas fa-sun';
    const text = isLight ? 'Mode Sombre' : 'Mode Clair';
    themeToggleButton.innerHTML = `<i class="${icon}"></i> Passer au ${text}`;
}

export function setupThemeToggle() {
    // Initialisation : charge la préférence ou utilise le sombre par défaut
    const currentTheme = localStorage.getItem('makmind-theme') || 'dark-mode';
    updateTheme(currentTheme);

    themeToggleButton.addEventListener('click', () => {
        const isLight = body.classList.contains('light-mode');
        const newTheme = isLight ? 'dark-mode' : 'light-mode';
        updateTheme(newTheme);
    });
}