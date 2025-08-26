# CVPerfect Test Snapshots

This directory contains test state snapshots for regression prevention and testing baseline management.

## Files

- `baseline.json` - Current testing baseline for comparison
- `snapshot-manager.js` - Tool for creating and managing test snapshots
- `snapshot-*.json` - Individual test snapshots with timestamps

## Usage

### Create a new baseline
```bash
node snapshot-manager.js baseline
```

### Validate current state against baseline
```bash
node snapshot-manager.js validate
```

### Create a named snapshot
```bash
node snapshot-manager.js create pre-deploy
```

## Test Categories

### Critical Tests
- **build**: npm run build - Must pass for deployment
- **lint**: npm run lint - Code quality check

### Functional Tests  
- **success_functions**: test-all-success-functions.js - Core CV optimization
- **payment_flow**: test-stripe-payment-flow.js - Stripe integration
- **api_endpoints**: test-api-endpoints.js - Backend API validation
- **responsive**: test-responsive.js - Mobile responsiveness
- **agents_integration**: test-agents-integration.js - CVPerfect agents
- **main_page**: test-main-page.js - Main page functionality

### Performance Tests
- **bundle_size**: test-bundle-size.js - Build size monitoring
- **page_load**: test-performance.js - Page load performance

## Integration with Hooks

This system integrates with Claude Code hooks:

- **pre-edit.sh**: Creates baseline before file modifications
- **post-edit.sh**: Validates changes against baseline
- **regression-guard.sh**: Comprehensive regression detection

## Best Practices

1. **Always create a baseline** before major changes
2. **Run validation** after any critical file modifications  
3. **Review snapshots** before committing changes
4. **Keep baselines updated** as features are added

## Automation

The snapshot system is automatically triggered by:
- File edit hooks (pre/post edit validation)
- Git commit hooks (regression guard)
- CI/CD pipeline integration (if configured)