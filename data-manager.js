#!/usr/bin/env node
/**
 * CVPerfect Data Management System
 * Handles structured storage and analysis management
 */

const fs = require('fs');
const path = require('path');

class DataManager {
    constructor() {
        this.dataDir = path.join(process.cwd(), 'data');
        this.analyzeDir = path.join(process.cwd(), 'analyze');
        this.ensureDirectories();
    }

    // Ensure all necessary directories exist
    ensureDirectories() {
        const dirs = [
            path.join(this.dataDir, 'cv'),
            path.join(this.dataDir, 'sessions'),
            path.join(this.dataDir, 'uploads'),
            path.join(this.dataDir, 'cache'),
            path.join(this.dataDir, 'exports'),
            path.join(this.analyzeDir, 'cv-analysis'),
            path.join(this.analyzeDir, 'performance'),
            path.join(this.analyzeDir, 'code-quality'),
            path.join(this.analyzeDir, 'security'),
            path.join(this.analyzeDir, 'user-feedback'),
            path.join(this.analyzeDir, 'reports')
        ];

        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    // Save data with automatic categorization
    saveData(category, id, data, metadata = {}) {
        const timestamp = new Date().toISOString();
        const filename = `${id}_${Date.now()}.json`;
        const filepath = path.join(this.dataDir, category, filename);
        
        const dataObject = {
            id: `${category}_${id}_${Date.now()}`,
            category: category,
            timestamp: timestamp,
            data: data,
            metadata: {
                ...metadata,
                saved_by: 'data-manager',
                file_size: JSON.stringify(data).length
            }
        };

        try {
            fs.writeFileSync(filepath, JSON.stringify(dataObject, null, 2));
            console.log(`✅ Data saved: ${filepath}`);
            return dataObject.id;
        } catch (error) {
            console.error(`❌ Error saving data: ${error.message}`);
            return null;
        }
    }

    // Save analysis results
    saveAnalysis(type, input, results, agent = 'unknown') {
        const timestamp = new Date().toISOString();
        const hash = this.generateHash(input.toString());
        const filename = `${type}_${Date.now()}_${hash}.json`;
        const filepath = path.join(this.analyzeDir, `${type}-analysis`, filename);
        
        const analysisObject = {
            id: `analysis_${Date.now()}_${hash}`,
            type: type,
            timestamp: timestamp,
            input: input,
            results: results,
            metadata: {
                version: '1.0',
                agent: agent,
                input_size: input.toString().length,
                results_size: JSON.stringify(results).length
            }
        };

        try {
            fs.writeFileSync(filepath, JSON.stringify(analysisObject, null, 2));
            console.log(`✅ Analysis saved: ${filepath}`);
            return analysisObject.id;
        } catch (error) {
            console.error(`❌ Error saving analysis: ${error.message}`);
            return null;
        }
    }

    // List all data in category
    listData(category = null) {
        try {
            if (category) {
                const categoryPath = path.join(this.dataDir, category);
                if (!fs.existsSync(categoryPath)) {
                    return { category, files: [], error: 'Category not found' };
                }
                
                const files = fs.readdirSync(categoryPath)
                    .filter(file => file.endsWith('.json'))
                    .map(file => {
                        const filepath = path.join(categoryPath, file);
                        const stats = fs.statSync(filepath);
                        return {
                            filename: file,
                            size: stats.size,
                            modified: stats.mtime.toISOString()
                        };
                    });
                
                return { category, files, count: files.length };
            } else {
                // List all categories
                const categories = fs.readdirSync(this.dataDir, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);
                
                return { categories, count: categories.length };
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    // List all analyses
    listAnalyses(type = null) {
        try {
            if (type) {
                const analysisPath = path.join(this.analyzeDir, `${type}-analysis`);
                if (!fs.existsSync(analysisPath)) {
                    return { type, analyses: [], error: 'Analysis type not found' };
                }
                
                const analyses = fs.readdirSync(analysisPath)
                    .filter(file => file.endsWith('.json'))
                    .map(file => {
                        const filepath = path.join(analysisPath, file);
                        const stats = fs.statSync(filepath);
                        try {
                            const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                            return {
                                id: content.id,
                                filename: file,
                                timestamp: content.timestamp,
                                agent: content.metadata?.agent || 'unknown',
                                size: stats.size
                            };
                        } catch {
                            return {
                                filename: file,
                                error: 'Invalid JSON',
                                size: stats.size
                            };
                        }
                    });
                
                return { type, analyses, count: analyses.length };
            } else {
                // List all analysis types
                const types = fs.readdirSync(this.analyzeDir, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory() && dirent.name.endsWith('-analysis'))
                    .map(dirent => dirent.name.replace('-analysis', ''));
                
                return { types, count: types.length };
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    // Get specific analysis
    getAnalysis(id) {
        try {
            // Search in all analysis directories
            const analysisTypes = fs.readdirSync(this.analyzeDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory() && dirent.name.endsWith('-analysis'))
                .map(dirent => dirent.name);
            
            for (const analysisType of analysisTypes) {
                const analysisDir = path.join(this.analyzeDir, analysisType);
                const files = fs.readdirSync(analysisDir);
                
                for (const file of files) {
                    if (file.includes(id) || file.startsWith(id)) {
                        const filepath = path.join(analysisDir, file);
                        const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                        if (content.id === id) {
                            return content;
                        }
                    }
                }
            }
            
            return { error: `Analysis with id ${id} not found` };
        } catch (error) {
            return { error: error.message };
        }
    }

    // Clean up old files
    cleanup(category, olderThanDays = 30) {
        try {
            const categoryPath = path.join(this.dataDir, category);
            if (!fs.existsSync(categoryPath)) {
                return { error: 'Category not found' };
            }
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
            
            const files = fs.readdirSync(categoryPath);
            let deletedCount = 0;
            
            files.forEach(file => {
                const filepath = path.join(categoryPath, file);
                const stats = fs.statSync(filepath);
                
                if (stats.mtime < cutoffDate) {
                    fs.unlinkSync(filepath);
                    deletedCount++;
                }
            });
            
            return { category, deletedFiles: deletedCount, cutoffDate: cutoffDate.toISOString() };
        } catch (error) {
            return { error: error.message };
        }
    }

    // Generate simple hash for deduplication
    generateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    // Get storage statistics
    getStats() {
        try {
            const stats = {
                data: {},
                analyze: {},
                total_size: 0,
                total_files: 0
            };

            // Data directory stats
            const dataCategories = fs.readdirSync(this.dataDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory());
            
            dataCategories.forEach(category => {
                const categoryPath = path.join(this.dataDir, category.name);
                const files = fs.readdirSync(categoryPath);
                let totalSize = 0;
                
                files.forEach(file => {
                    const filepath = path.join(categoryPath, file);
                    totalSize += fs.statSync(filepath).size;
                });
                
                stats.data[category.name] = {
                    files: files.length,
                    size: totalSize
                };
                stats.total_files += files.length;
                stats.total_size += totalSize;
            });

            // Analyze directory stats
            const analyzeTypes = fs.readdirSync(this.analyzeDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory());
            
            analyzeTypes.forEach(type => {
                const typePath = path.join(this.analyzeDir, type.name);
                const files = fs.readdirSync(typePath);
                let totalSize = 0;
                
                files.forEach(file => {
                    const filepath = path.join(typePath, file);
                    totalSize += fs.statSync(filepath).size;
                });
                
                stats.analyze[type.name] = {
                    files: files.length,
                    size: totalSize
                };
                stats.total_files += files.length;
                stats.total_size += totalSize;
            });

            return stats;
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Export for use as module
module.exports = DataManager;

// CLI interface
if (require.main === module) {
    const dataManager = new DataManager();
    
    const command = process.argv[2];
    const arg1 = process.argv[3];
    const arg2 = process.argv[4];
    
    switch (command) {
        case 'list-data':
            console.log(JSON.stringify(dataManager.listData(arg1), null, 2));
            break;
        case 'list-analyses':
            console.log(JSON.stringify(dataManager.listAnalyses(arg1), null, 2));
            break;
        case 'get-analysis':
            console.log(JSON.stringify(dataManager.getAnalysis(arg1), null, 2));
            break;
        case 'cleanup':
            console.log(JSON.stringify(dataManager.cleanup(arg1, parseInt(arg2) || 30), null, 2));
            break;
        case 'stats':
            console.log(JSON.stringify(dataManager.getStats(), null, 2));
            break;
        default:
            console.log(`
CVPerfect Data Manager

Usage:
  node data-manager.js list-data [category]     - List data in category
  node data-manager.js list-analyses [type]    - List analyses of type
  node data-manager.js get-analysis <id>       - Get specific analysis
  node data-manager.js cleanup <category> [days] - Clean old files
  node data-manager.js stats                   - Show storage statistics

Examples:
  node data-manager.js list-data cv
  node data-manager.js list-analyses performance
  node data-manager.js cleanup cache 7
  node data-manager.js stats
            `);
    }
}