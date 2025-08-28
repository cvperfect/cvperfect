/**
 * CVPerfect Port Discovery Utility
 * Professional-grade dynamic port detection for testing infrastructure
 */

const http = require('http');

class PortDiscovery {
    /**
     * Find active CVPerfect server across standard Next.js ports
     * @returns {Promise<{port: number, available: boolean}>}
     */
    static async findActiveServer() {
        const possiblePorts = [3004, 3002, 3001, 3000, 3003]; // Start with 3004 as active server
        
        for (const port of possiblePorts) {
            try {
                const isActive = await this.checkPort(port);
                if (isActive) {
                    return { port, available: true };
                }
            } catch (error) {
                // Port check failed, continue to next
                continue;
            }
        }
        
        throw new Error('No active CVPerfect server found on any standard port');
    }
    
    /**
     * Check if CVPerfect server is running on specific port
     * @param {number} port 
     * @returns {Promise<boolean>}
     */
    static async checkPort(port) {
        return new Promise((resolve) => {
            const req = http.request({
                hostname: 'localhost',
                port: port,
                path: '/api/health',
                method: 'GET',
                timeout: 2000
            }, (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
            
            req.end();
        });
    }
    
    /**
     * Get all listening ports in range
     * @returns {Promise<number[]>}
     */
    static async getAllListeningPorts() {
        const ports = [];
        const testPorts = [3000, 3001, 3002, 3003, 3004];
        
        for (const port of testPorts) {
            if (await this.isPortListening(port)) {
                ports.push(port);
            }
        }
        
        return ports;
    }
    
    /**
     * Check if port is listening (not necessarily CVPerfect)
     * @param {number} port 
     * @returns {Promise<boolean>}
     */
    static async isPortListening(port) {
        return new Promise((resolve) => {
            const req = http.request({
                hostname: 'localhost',
                port: port,
                path: '/',
                method: 'HEAD',
                timeout: 1000
            }, () => {
                resolve(true);
            });
            
            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
            
            req.end();
        });
    }
}

module.exports = PortDiscovery;