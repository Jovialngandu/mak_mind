const intervalInput = document.getElementById('interval-input');
const saveButton = document.getElementById('save-settings-btn');
const statusMessage = document.getElementById('settings-status');

/**
 * Met à jour l'interface utilisateur avec les paramètres chargés depuis la DB.
 * @param {object} settings - L'objet de paramètres reçu du Main Process.
 */
function updateSettingsUI(settings) {
    if (settings) {
        // Utiliser la valeur de la DB, ou 500ms par défaut si non définie
        intervalInput.value = settings.watcherInterval || 500; 
        
        // Logique pour le thème (non implémentée ici mais dépendrait de settings.theme)
        // const themeButton = document.getElementById('theme-toggle');
    }
}

/**
 * Affiche un message de statut temporaire à l'utilisateur.
 * @param {string} message - Le message à afficher.
 * @param {boolean} isSuccess - Vrai si c'est un succès, faux si une erreur.
 */
function showStatus(message, isSuccess) {
    statusMessage.textContent = message;
    statusMessage.style.color = isSuccess ? 'var(--color-success)' : 'var(--color-error)';
    setTimeout(() => {
        statusMessage.textContent = '';
    }, 3000);
}

/**
 * Configure les gestionnaires d'événements pour le chargement et la sauvegarde.
 */
export function setupSettings() {
    // 1. Charger les paramètres au démarrage
    loadSettings();

    // 2. Gestionnaire du bouton de sauvegarde
    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            
            const newSettings = {
                // S'assurer que l'intervalle est un nombre valide
                watcherInterval: parseInt(intervalInput.value) || 500, 
                // Ajouter d'autres paramètres ici (ex: theme, limit, etc.)
            };

            // Appel IPC pour sauvegarder les paramètres
            try {
                const result = await window.clipboardAPI.saveSettings(newSettings);
                
                if (result.success) {
                    showStatus('Paramètres sauvegardés avec succès !', true);
                    // Si l'intervalle du watcher a changé, nous pourrions 
                    // informer le Main Process de redémarrer le watcher ici.
                    
                    // Exemple d'appel pour redémarrer le watcher:
                    // window.clipboardAPI.restartWatcher(newSettings.watcherInterval);
                } else {
                    showStatus(`Erreur de sauvegarde: ${result.message}`, false);
                }

            } catch (error) {
                console.error("Erreur IPC lors de la sauvegarde des paramètres:", error);
                showStatus('Erreur de communication avec le service de paramètres.', false);
            }
        });
    }
}

/**
 * Charge les paramètres via IPC et met à jour l'interface.
 */
async function loadSettings() {
    try {
        const settings = await window.clipboardAPI.getSettings();
        updateSettingsUI(settings);
    } catch (error) {
        console.error("Erreur IPC lors du chargement des paramètres:", error);
    }
}

// ----------------------------------------------------
// NOTE : La logique du Theme Toggle pourrait être ajoutée ici plus tard 
// ----------------------------------------------------