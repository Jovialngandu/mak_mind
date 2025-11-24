const exportButton = document.getElementById('export-button');
const includeMetaCheckbox = document.getElementById('include-meta');
const exportStatus = document.getElementById('export-status');

function showExportStatus(message, isSuccess = true) {
    exportStatus.textContent = message;
    exportStatus.className = isSuccess ? 'status-message success' : 'status-message error';
    setTimeout(() => {
        exportStatus.textContent = '';
        exportStatus.className = 'status-message';
    }, 4000);
}

export function setupExport() {
    if (!exportButton) return;

    exportButton.addEventListener('click', async () => {
        exportButton.disabled = true;
        showExportStatus("Préparation de l'export...", true);

        // Récupérer le format sélectionné
        const format = document.querySelector('input[name="export-format"]:checked').value;
        const includeMeta = includeMetaCheckbox.checked;

        try {
            const result = await window.clipboardAPI.exportClips({ format, includeMeta });

            if (result.success) {
                showExportStatus(`Export réussi! Fichier sauvegardé à: ${result.filePath}`, true);
            } else {
                showExportStatus(`Export échoué: ${result.message || "Erreur inconnue."}`, false);
            }
        } catch (error) {
            console.error("Erreur lors de l'appel IPC pour l'export:", error);
            showExportStatus("Erreur de communication avec le processus principal.", false);
        } finally {
            exportButton.disabled = false;
        }
    });
}