#!/usr/bin/env node

/**
 * CVPerfect Checkpoint-Driven Workflow Manager
 * 
 * Implements safe development workflow with automatic checkpoints, branch management,
 * and rollback capabilities. Prevents "fix one break another" by creating validated
 * checkpoints at each working step.
 * 
 * Usage:
 *   node checkpoint-workflow.js start [feature-name]     # Start new feature branch
 *   node checkpoint-workflow.js checkpoint [message]    # Create validated checkpoint
 *   node checkpoint-workflow.js validate                # Validate current state
 *   node checkpoint-workflow.js rollback [steps]        # Rollback N checkpoints
 *   node checkpoint-workflow.js finish                  # Complete feature and merge
 *   node checkpoint-workflow.js status                  # Show current status
 *   node checkpoint-workflow.js cleanup                 # Clean old branches
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();
const WORKFLOW_DIR = path.join(PROJECT_ROOT, '.claude', 'checkpoint-workflow');
const STATE_FILE = path.join(WORKFLOW_DIR, 'current-workflow.json');

class CheckpointWorkflow {
    constructor() {
        this.ensureDirectories();
        this.state = this.loadState();
    }
    
    ensureDirectories() {
        if (!fs.existsSync(WORKFLOW_DIR)) {
            fs.mkdirSync(WORKFLOW_DIR, { recursive: true });
        }
    }
    
    loadState() {
        if (fs.existsSync(STATE_FILE)) {
            try {
                return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
            } catch (error) {
                console.log('⚠️ Warning: Could not load workflow state, creating new');
            }
        }
        
        return {
            active: false,
            feature_branch: null,
            started_at: null,
            checkpoints: [],
            current_step: 0,
            last_validation: null
        };
    }
    
    saveState() {
        fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
    }
    
    getCurrentBranch() {
        try {
            return execSync('git branch --show-current', { stdio: 'pipe' }).toString().trim();
        } catch {
            return 'unknown';
        }
    }
    
    getCurrentCommit() {
        try {
            return execSync('git rev-parse HEAD', { stdio: 'pipe' }).toString().trim();
        } catch {
            return 'unknown';
        }
    }
    
    isWorkingTreeClean() {
        try {
            const status = execSync('git status --porcelain', { stdio: 'pipe' }).toString().trim();
            return status === '';
        } catch {
            return false;
        }
    }
    
    async runValidation() {
        console.log('🧪 Running validation tests...');
        
        try {
            // Run critical tests only for speed
            execSync('node test-regression-suite.js --critical', { 
                stdio: 'inherit',
                timeout: 180000 
            });
            
            // Run snapshot validation
            execSync('node .claude/test-snapshots/snapshot-manager.js validate', {
                stdio: 'inherit',
                timeout: 120000
            });
            
            return { status: 'PASS', timestamp: new Date().toISOString() };
            
        } catch (error) {
            console.log(`❌ Validation failed: ${error.message}`);
            return { 
                status: 'FAIL', 
                timestamp: new Date().toISOString(), 
                error: error.message.slice(0, 500) 
            };
        }
    }
    
    async startFeature(featureName) {
        if (this.state.active) {
            console.log(`❌ Workflow already active for: ${this.state.feature_branch}`);
            console.log('   Finish current workflow first or use --force');
            return false;
        }
        
        if (!featureName) {
            console.log('❌ Feature name required');
            return false;
        }
        
        console.log(`🚀 Starting checkpoint workflow for: ${featureName}`);
        
        // Ensure we're on main branch and it's clean
        const currentBranch = this.getCurrentBranch();
        if (currentBranch !== 'main') {
            console.log('⚠️ Switching to main branch...');
            try {
                execSync('git checkout main', { stdio: 'inherit' });
            } catch (error) {
                console.log(`❌ Could not switch to main: ${error.message}`);
                return false;
            }
        }
        
        if (!this.isWorkingTreeClean()) {
            console.log('❌ Working tree not clean. Commit or stash changes first.');
            return false;
        }
        
        // Create baseline snapshot
        console.log('📸 Creating baseline snapshot...');
        try {
            execSync('node .claude/test-snapshots/snapshot-manager.js baseline', { 
                stdio: 'inherit' 
            });
        } catch (error) {
            console.log(`⚠️ Could not create baseline: ${error.message}`);
        }
        
        // Create feature branch
        const branchName = `feature/${featureName.replace(/[^a-zA-Z0-9-]/g, '-')}`;
        console.log(`🌿 Creating branch: ${branchName}`);
        
        try {
            execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
        } catch (error) {
            console.log(`❌ Could not create branch: ${error.message}`);
            return false;
        }
        
        // Initialize workflow state
        this.state = {
            active: true,
            feature_branch: branchName,
            feature_name: featureName,
            started_at: new Date().toISOString(),
            started_from_commit: this.getCurrentCommit(),
            checkpoints: [],
            current_step: 0,
            last_validation: null
        };
        
        this.saveState();
        
        console.log(`✅ Checkpoint workflow started!`);
        console.log(`   Branch: ${branchName}`);
        console.log(`   Use: node checkpoint-workflow.js checkpoint "message" after each working change`);
        
        return true;
    }
    
    async createCheckpoint(message) {
        if (!this.state.active) {
            console.log('❌ No active workflow. Start one first.');
            return false;
        }
        
        const currentBranch = this.getCurrentBranch();
        if (currentBranch !== this.state.feature_branch) {
            console.log(`❌ Not on feature branch. Expected: ${this.state.feature_branch}, Current: ${currentBranch}`);
            return false;
        }
        
        if (!message) {
            message = `checkpoint-${this.state.current_step + 1}`;
        }
        
        console.log(`🔄 Creating checkpoint: ${message}`);
        
        // Check if there are changes to commit
        if (this.isWorkingTreeClean()) {
            console.log('⚠️ No changes to checkpoint');
            return false;
        }
        
        // Validate current state BEFORE committing
        console.log('🧪 Pre-commit validation...');
        const validation = await this.runValidation();
        
        if (validation.status === 'FAIL') {
            console.log('❌ Validation failed - checkpoint aborted');
            console.log('   Fix issues and try again, or use --force to checkpoint anyway');
            return false;
        }
        
        // Create git commit
        try {
            execSync('git add -A', { stdio: 'inherit' });
            
            const commitMessage = `checkpoint: ${message}

🤖 Generated with Claude Code Checkpoint Workflow
Co-Authored-By: Claude <noreply@anthropic.com>`;

            execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
            
        } catch (error) {
            console.log(`❌ Could not create commit: ${error.message}`);
            return false;
        }
        
        // Record checkpoint
        const checkpoint = {
            step: this.state.current_step + 1,
            commit_hash: this.getCurrentCommit(),
            message: message,
            timestamp: new Date().toISOString(),
            validation: validation,
            files_changed: this.getChangedFiles()
        };
        
        this.state.checkpoints.push(checkpoint);
        this.state.current_step++;
        this.state.last_validation = validation;
        this.saveState();
        
        console.log(`✅ Checkpoint created successfully!`);
        console.log(`   Step: ${checkpoint.step}`);
        console.log(`   Commit: ${checkpoint.commit_hash.slice(0, 8)}`);
        console.log(`   Validation: ${validation.status}`);
        
        return true;
    }
    
    getChangedFiles() {
        try {
            const diff = execSync('git diff --name-only HEAD~1 HEAD', { 
                stdio: 'pipe' 
            }).toString().trim();
            return diff ? diff.split('\n') : [];
        } catch {
            return [];
        }
    }
    
    async validateCurrent() {
        if (!this.state.active) {
            console.log('❌ No active workflow');
            return false;
        }
        
        console.log('🔍 Validating current state...');
        
        const validation = await this.runValidation();
        
        if (validation.status === 'PASS') {
            console.log('✅ Current state is valid');
        } else {
            console.log('❌ Current state has issues');
        }
        
        this.state.last_validation = validation;
        this.saveState();
        
        return validation.status === 'PASS';
    }
    
    async rollback(steps = 1) {
        if (!this.state.active) {
            console.log('❌ No active workflow');
            return false;
        }
        
        if (this.state.checkpoints.length === 0) {
            console.log('❌ No checkpoints to rollback to');
            return false;
        }
        
        const targetStep = Math.max(0, this.state.current_step - steps);
        const targetCheckpoint = this.state.checkpoints[targetStep];
        
        if (!targetCheckpoint) {
            console.log('❌ Invalid rollback target');
            return false;
        }
        
        console.log(`🔄 Rolling back ${steps} step(s)...`);
        console.log(`   Target: Step ${targetCheckpoint.step} (${targetCheckpoint.message})`);
        console.log(`   Commit: ${targetCheckpoint.commit_hash.slice(0, 8)}`);
        
        // Confirm rollback
        console.log('⚠️ This will discard all changes after the target checkpoint');
        
        try {
            // Hard reset to target commit
            execSync(`git reset --hard ${targetCheckpoint.commit_hash}`, { 
                stdio: 'inherit' 
            });
            
            // Update workflow state
            this.state.checkpoints = this.state.checkpoints.slice(0, targetStep + 1);
            this.state.current_step = targetStep;
            this.saveState();
            
            console.log(`✅ Rolled back to step ${targetCheckpoint.step}`);
            
            // Validate rolled back state
            await this.validateCurrent();
            
            return true;
            
        } catch (error) {
            console.log(`❌ Rollback failed: ${error.message}`);
            return false;
        }
    }
    
    async finishFeature() {
        if (!this.state.active) {
            console.log('❌ No active workflow');
            return false;
        }
        
        console.log(`🏁 Finishing feature: ${this.state.feature_name}`);
        
        // Final validation
        console.log('🧪 Running final validation...');
        const validation = await this.runValidation();
        
        if (validation.status === 'FAIL') {
            console.log('❌ Final validation failed - feature not ready');
            console.log('   Fix issues or rollback to working checkpoint');
            return false;
        }
        
        // Ensure working tree is clean
        if (!this.isWorkingTreeClean()) {
            console.log('❌ Working tree not clean. Create final checkpoint first.');
            return false;
        }
        
        console.log('🔄 Merging to main...');
        
        try {
            // Switch to main and merge
            execSync('git checkout main', { stdio: 'inherit' });
            execSync(`git merge ${this.state.feature_branch} --no-ff -m "Merge ${this.state.feature_branch}

Feature: ${this.state.feature_name}
Checkpoints: ${this.state.checkpoints.length}
Duration: ${this.getWorkflowDuration()}

🤖 Generated with Claude Code Checkpoint Workflow
Co-Authored-By: Claude <noreply@anthropic.com>"`, { stdio: 'inherit' });
            
            // Clean up feature branch
            execSync(`git branch -d ${this.state.feature_branch}`, { stdio: 'inherit' });
            
            // Create completion snapshot
            execSync('node .claude/test-snapshots/snapshot-manager.js create feature-complete', { 
                stdio: 'inherit' 
            });
            
        } catch (error) {
            console.log(`❌ Merge failed: ${error.message}`);
            console.log('   Manual intervention required');
            return false;
        }
        
        // Archive workflow state
        this.archiveWorkflow();
        
        // Reset state
        this.state = {
            active: false,
            feature_branch: null,
            started_at: null,
            checkpoints: [],
            current_step: 0,
            last_validation: null
        };
        
        this.saveState();
        
        console.log('✅ Feature completed and merged successfully!');
        console.log(`   Checkpoints created: ${this.state.checkpoints?.length || 0}`);
        console.log(`   Duration: ${this.getWorkflowDuration()}`);
        
        return true;
    }
    
    archiveWorkflow() {
        const archiveFile = path.join(WORKFLOW_DIR, `completed-${Date.now()}.json`);
        const archiveData = {
            ...this.state,
            completed_at: new Date().toISOString(),
            final_commit: this.getCurrentCommit()
        };
        
        fs.writeFileSync(archiveFile, JSON.stringify(archiveData, null, 2));
        console.log(`📁 Workflow archived to: ${archiveFile}`);
    }
    
    getWorkflowDuration() {
        if (!this.state.started_at) return 'unknown';
        
        const start = new Date(this.state.started_at);
        const now = new Date();
        const duration = now - start;
        
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }
    
    showStatus() {
        console.log('📊 Checkpoint Workflow Status');
        console.log('─'.repeat(50));
        
        if (!this.state.active) {
            console.log('Status: No active workflow');
            console.log('Use: node checkpoint-workflow.js start [feature-name] to begin');
            return;
        }
        
        console.log(`Feature: ${this.state.feature_name}`);
        console.log(`Branch: ${this.state.feature_branch}`);
        console.log(`Started: ${new Date(this.state.started_at).toLocaleString()}`);
        console.log(`Duration: ${this.getWorkflowDuration()}`);
        console.log(`Current Step: ${this.state.current_step}`);
        console.log(`Checkpoints: ${this.state.checkpoints.length}`);
        
        if (this.state.last_validation) {
            console.log(`Last Validation: ${this.state.last_validation.status} (${new Date(this.state.last_validation.timestamp).toLocaleString()})`);
        }
        
        if (this.state.checkpoints.length > 0) {
            console.log('\nRecent Checkpoints:');
            this.state.checkpoints.slice(-3).forEach(cp => {
                console.log(`  ${cp.step}. ${cp.message} (${cp.commit_hash.slice(0, 8)}) ${cp.validation.status}`);
            });
        }
        
        console.log('\nAvailable Commands:');
        console.log('  checkpoint [message] - Create new checkpoint');
        console.log('  validate            - Validate current state');
        console.log('  rollback [steps]    - Rollback N checkpoints');
        console.log('  finish              - Complete and merge feature');
    }
    
    cleanup() {
        console.log('🧹 Cleaning up old workflows...');
        
        // Clean old completed workflow files (>30 days)
        const files = fs.readdirSync(WORKFLOW_DIR);
        const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000);
        let cleaned = 0;
        
        files.forEach(file => {
            if (file.startsWith('completed-') && file.endsWith('.json')) {
                const filePath = path.join(WORKFLOW_DIR, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime.getTime() < cutoffTime) {
                    fs.unlinkSync(filePath);
                    console.log(`  🗑️ Removed: ${file}`);
                    cleaned++;
                }
            }
        });
        
        // Clean merged feature branches
        try {
            execSync('git branch --merged main | grep "feature/" | xargs -r git branch -d', {
                stdio: 'pipe'
            });
        } catch (error) {
            // Ignore errors - branches may not exist
        }
        
        console.log(`✅ Cleaned ${cleaned} old workflow files`);
    }
}

// CLI Interface
async function main() {
    const [,, command, ...args] = process.argv;
    const workflow = new CheckpointWorkflow();
    
    try {
        switch (command) {
            case 'start':
                await workflow.startFeature(args[0]);
                break;
                
            case 'checkpoint':
                await workflow.createCheckpoint(args.join(' '));
                break;
                
            case 'validate':
                await workflow.validateCurrent();
                break;
                
            case 'rollback':
                await workflow.rollback(parseInt(args[0]) || 1);
                break;
                
            case 'finish':
                await workflow.finishFeature();
                break;
                
            case 'status':
                workflow.showStatus();
                break;
                
            case 'cleanup':
                workflow.cleanup();
                break;
                
            default:
                console.log('CVPerfect Checkpoint-Driven Workflow Manager');
                console.log('\nUsage:');
                console.log('  start [name]        - Start new feature workflow');
                console.log('  checkpoint [msg]    - Create validated checkpoint');
                console.log('  validate           - Validate current state');
                console.log('  rollback [steps]   - Rollback N checkpoints (default: 1)');
                console.log('  finish             - Complete feature and merge');
                console.log('  status             - Show current workflow status');
                console.log('  cleanup            - Clean old workflows and branches');
                console.log('\nExample workflow:');
                console.log('  node checkpoint-workflow.js start fix-payment-bug');
                console.log('  # Make some changes...');
                console.log('  node checkpoint-workflow.js checkpoint "fixed stripe integration"');
                console.log('  # Make more changes...');
                console.log('  node checkpoint-workflow.js checkpoint "added error handling"');
                console.log('  node checkpoint-workflow.js finish');
                process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = CheckpointWorkflow;