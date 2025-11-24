const fs = require('fs/promises');
const path = require('path');
const { dialog } = require('electron');
const ClipboardManager = require('../clipboard/ClipBoardManager'); // Pour accéder aux données

class ExportManager {
    constructor() {
        this.clipboardService = ClipboardManager;
    }

    /**
     * Formate les clips en chaîne CSV.
     * @param {Array<Object>} clips - Les données des clips.
     * @param {boolean} includeMeta - Inclure les colonnes source et date.
     * @returns {string} La chaîne CSV.
     */
    _formatToCSV(clips, includeMeta) {
        let headers = ['content'];
        if (includeMeta) {
            headers = ['id', 'content', 'source', 'created_at'];
        }
        
        const rows = clips.map(clip => {
            let row = [];
            if (includeMeta) {
                row.push(clip.id);
            }
            // IMPORTANT : Échapper les guillemets et les sauts de ligne pour le CSV
            row.push(`"${String(clip.content).replace(/"/g, '""').replace(/\n/g, '\\n')}"`); 
            
            if (includeMeta) {
                row.push(clip.source || 'Système');
                row.push(clip.created_at);
            }
            return row.join(';'); // Utiliser le point-virgule comme séparateur
        });

        return [headers.join(';'), ...rows].join('\n');
    }

    /**
     * Exporte les clips vers un fichier dans le format spécifié.
     * @param {Object} options - { format: 'csv' | 'json', includeMeta: boolean }
     */
    async exportClips(options) {
        // 1. Récupérer toutes les données (ou une sélection filtrée si vous le souhaitez)
        let clips = await this.clipboardService.getRecent(1000000); // Récupérer tout
        
        if (!options.includeMeta) {
            // Si l'utilisateur ne veut que le contenu, simplifier l'objet
            clips = clips.map(clip => ({ content: clip.content }));
        }

        let fileContent;
        const format = options.format.toLowerCase();

        if (format === 'json') {
            fileContent = JSON.stringify(clips, null, 2);
        } else if (format === 'csv') {
            fileContent = this._formatToCSV(clips, options.includeMeta);
        } else {
            return { success: false, message: `Format ${format} non supporté.` };
        }

        // 2. Afficher la boîte de dialogue de sauvegarde
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'Exporter l\'historique',
            defaultPath: path.join(process.env.HOME || process.env.USERPROFILE, `MakMind_Export_${Date.now()}.${format}`),
            filters: [
                { name: `${format.toUpperCase()} Files`, extensions: [format] }
            ]
        });

        if (canceled || !filePath) {
            return { success: false, message: "Sauvegarde annulée par l'utilisateur." };
        }

        // 3. Écrire le fichier
        try {
            await fs.writeFile(filePath, fileContent, 'utf8');
            return { success: true, filePath };
        } catch (error) {
            console.error('Erreur lors de l\'écriture du fichier d\'export:', error);
            return { success: false, message: `Échec de l'écriture du fichier: ${error.message}` };
        }
    }
}

module.exports = new ExportManager();