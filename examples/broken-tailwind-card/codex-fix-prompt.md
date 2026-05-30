# Codex Visual Repair Task

You are working on an existing frontend implementation.

Your task is to make the current UI match the target screenshot more closely.

## Important Rules

- Do not rewrite the whole app.
- Do not change copy/text content unless explicitly needed.
- Do not add new features.
- Do not change routing.
- Do not remove existing functionality.
- Focus only on visual fidelity.
- Prefer small, targeted changes.
- Keep the current stack and component structure.

## StitchGuard Findings

Visual Match: 99.0%

Main differences:
1. The header area differs from the target.
2. The largest visual difference appears in the upper-content region. This often indicates mismatched hero spacing, card size, or header alignment.
3. The middle content area differs significantly from the target.
4. The lower content area differs significantly from the target.
5. The bottom area has visible spacing differences. This may indicate changed bottom navigation height, padding, or safe-area handling.

## Suggested Fix Direction

- Check hero/header spacing first.
- Compare card padding and border radius.
- Review bottom safe-area and navigation padding.
- Run the app again and compare screenshots after changes.

## Expected Result

The implementation should visually match the provided target screenshot more closely without introducing unrelated changes.