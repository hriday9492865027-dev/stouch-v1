# STouch — AntiGravity Project Starter Pack

This folder contains the product and implementation documents to upload into your AntiGravity workspace.

## Files
- `STouch_PRD.md` — editable Markdown source of the full Product Requirements Document.
- `STouch_PRD.docx` — Word version of the same PRD.
- `ANTIGRAVITY_BUILD_INSTRUCTIONS.md` — rules for the coding agent and phased build plan.
- `PROJECT_STRUCTURE.md` — requested repository structure and module boundaries.
- `GITHUB_REPOSITORY_GUIDE.md` — repository evaluation, reuse and licensing checklist.
- `THIRD_PARTY_LICENSES_TEMPLATE.md` — template to record any reused open-source code.

## Recommended use in AntiGravity
1. Upload all files to the STouch project/workspace.
2. Ask AntiGravity to read `STouch_PRD.md` and `ANTIGRAVITY_BUILD_INSTRUCTIONS.md` first.
3. Ask it to create only the project skeleton and Android capability-detection foundation.
4. Do not ask it to implement every future module in one prompt.
5. Build and test the reference repositories separately before copying code.
6. Keep test results and exact device/firmware compatibility records in the repository.

## Important technical note
Bluetooth being present on an Android phone does not guarantee that the phone can act as a Bluetooth HID mouse. STouch must check the native Bluetooth HID Device capability and validate actual registration, pairing and input reports. Do not claim support based only on manufacturer or Android version.
