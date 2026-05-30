# StitchGuard Report

## Summary

Target: `I:\StitchGuard\examples\shadcn-dashboard\target.png`  
Actual: `I:\StitchGuard\examples\shadcn-dashboard\actual.png`  
Viewport: `390x844`  
Visual Match: `99.5%`  
Changed Pixels: `0.5%`  
Risk Level: `Low`  
Status: `Excellent`

## Main Findings

### 1. Layout finding

The header area differs from the target.

Severity: High  
Confidence: 0.95
Region: header

### 2. Layout finding

The largest visual difference appears in the upper-content region. This often indicates mismatched hero spacing, card size, or header alignment.

Severity: High  
Confidence: 0.95
Region: upper-content

### 3. Layout finding

The middle content area differs significantly from the target.

Severity: High  
Confidence: 0.95
Region: middle-content

### 4. Layout finding

The lower content area differs significantly from the target.

Severity: High  
Confidence: 0.95
Region: lower-content

### 5. Layout finding

The bottom area has visible spacing differences. This may indicate changed bottom navigation height, padding, or safe-area handling.

Severity: High  
Confidence: 0.95
Region: bottom

## Generated Repair Prompt

See `codex-fix-prompt.md`.

## Artifacts

- `diff.png`
- `heatmap.png`
- `result.json`
- `codex-fix-prompt.md`
