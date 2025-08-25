#!/usr/bin/env node
/**
 * Simple test for -sa shortcut functionality
 */

const { handleSubagentShortcut } = require('./claude-cvperfect-integration');

async function simpleTest() {
    console.log('🧪 Simple test for -sa shortcut');
    console.log('='.repeat(40));
    
    try {
        const result = await handleSubagentShortcut('Fix React component styling', { testMode: true });
        
        console.log('✅ Test completed successfully');
        console.log('📊 Result:', JSON.stringify(result, null, 2));
        
        if (result.success && result.agent) {
            console.log('🎉 CVPerfect agent delegation successful!');
            console.log(`🤖 Agent used: ${result.agent}`);
        } else if (result.useTaskTool) {
            console.log('🔄 Fallback to Task tool successful!');
            console.log(`🛠️ Subagent type: ${result.taskToolParams.subagent_type}`);
        } else {
            console.log('⚠️ Unexpected result format');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

simpleTest();