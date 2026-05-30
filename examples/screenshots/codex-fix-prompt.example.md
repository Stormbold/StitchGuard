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

Visual Match: 82.4%

Main differences:
1. The upper-content region differs significantly.
2. The primary accent color appears different from the target.
3. The bottom spacing/navigation region differs visibly.

## Suggested Fix Direction

- Check hero/header spacing first.
- Compare card padding and border radius.
- Align primary color tokens with the target.
- Review bottom safe-area and navigation padding.
- Run the app again and compare screenshots after changes.

## Expected Result

The implementation should visually match the provided target screenshot more closely without introducing unrelated changes.
