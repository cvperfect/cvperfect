/**
 * Communication bridge between Claude Code and CVPerfect Agents System
 */

const net = require('net');
const readline = require('readline');

class AgentsCommunicator {
    constructor() {
        this.client = null;
        this.connected = false;
    }

    async connectToAgents() {
        console.log('🔗 Attempting to connect to CVPerfect Agents System...');
        
        // Try to connect to the agents system (assuming it runs on default port)
        try {
            this.client = new net.Socket();
            
            this.client.connect(3001, 'localhost', () => {
                console.log('✅ Connected to CVPerfect Agents System');
                this.connected = true;
            });

            this.client.on('data', (data) => {
                console.log('📨 Agent Response:', data.toString());
            });

            this.client.on('close', () => {
                console.log('🔌 Connection to agents closed');
                this.connected = false;
            });

            this.client.on('error', (err) => {
                console.log('❌ Agent connection error:', err.message);
                console.log('💡 Make sure agents system is running with: node start-agents-system.js');
            });

        } catch (error) {
            console.log('❌ Failed to connect to agents:', error.message);
        }
    }

    async sendCommand(command) {
        if (!this.connected) {
            console.log('⚠️ Not connected to agents system. Trying to connect...');
            await this.connectToAgents();
            
            // Wait a bit for connection
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (this.connected && this.client) {
            console.log(`📤 Sending to agents: ${command}`);
            this.client.write(command + '\n');
        } else {
            console.log('❌ Unable to send command - not connected to agents');
        }
    }

    disconnect() {
        if (this.client) {
            this.client.destroy();
        }
    }
}

// Available agent commands for CVPerfect analysis
const AGENT_COMMANDS = {
    'website-analysis': 'analyze-website https://cvperfect.pl --comprehensive',
    'cv-optimization-test': 'test-cv-optimization --photo-preservation --truncation-check',
    'security-scan': 'security-scan --endpoints --vulnerabilities --best-practices',
    'performance-audit': 'performance-audit --lighthouse --speed --optimization',
    'payment-flow-test': 'test-payment-flow --stripe --integration --success-failure',
    'mobile-responsiveness': 'test-responsive --mobile --tablet --desktop --touch-targets',
    'code-quality-scan': 'code-quality --technical-debt --security --patterns',
    'ux-improvements': 'analyze-ux --retention --conversion --user-flow',
    'status': 'status',
    'help': 'help'
};

async function main() {
    const communicator = new AgentsCommunicator();
    
    console.log('🚀 CVPerfect Agents Communication Bridge');
    console.log('=======================================');
    console.log('Available commands:');
    
    Object.entries(AGENT_COMMANDS).forEach(([key, command]) => {
        console.log(`  ${key}: ${command}`);
    });
    
    console.log('\n🔗 Connecting to agents system...');
    await communicator.connectToAgents();
    
    // Interactive mode
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('\n💬 Enter command (or "quit" to exit):');
    
    rl.on('line', async (input) => {
        const command = input.trim();
        
        if (command === 'quit' || command === 'exit') {
            console.log('👋 Disconnecting from agents...');
            communicator.disconnect();
            rl.close();
            process.exit(0);
        }
        
        if (AGENT_COMMANDS[command]) {
            await communicator.sendCommand(AGENT_COMMANDS[command]);
        } else {
            await communicator.sendCommand(command);
        }
        
        console.log('\n💬 Enter command (or "quit" to exit):');
    });
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = AgentsCommunicator;