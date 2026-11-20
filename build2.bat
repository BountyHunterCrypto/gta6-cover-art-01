@echo off
cd /d C:\Games\AutoClicker\test\gta6-cover-art-01
set CODEX=C:\Users\ryanm\AppData\Roaming\npm\codex.cmd

call %CODEX% exec --dangerously-bypass-approvals-and-sandbox "Step 1. In main.ts, after the dossier.json write, add a writeFileSync that writes cover.json beside dossier.json containing JSON with the three supported post sizes 1080x1080, 1080x1350 and 1920x1080 and the default caption Sunset Heist. Say in one sentence what you changed."
echo ---- STEP 1 DONE ----

call %CODEX% exec --dangerously-bypass-approvals-and-sandbox "Step 2. In app/index.html add a Reset button with id reset directly above the export button. Say in one sentence what you changed."
echo ---- STEP 2 DONE ----

call %CODEX% exec --dangerously-bypass-approvals-and-sandbox "Step 3. In app/src/main.js wire the reset button: on click set every panel back to img null, zoom 1, x 0, y 0, set the caption back to Sunset Heist, select panel 1 and redraw. Say in one sentence what you changed."
echo ---- STEP 3 DONE ----

call %CODEX% exec --dangerously-bypass-approvals-and-sandbox "Step 4. In app/style.css give the reset button a ghost style: transparent background, 2px solid border, same padding as the export button. Say in one sentence what you changed."
echo ---- STEP 4 DONE ----

call %CODEX% exec --dangerously-bypass-approvals-and-sandbox "Step 5. In app/src/main.js add a keydown listener on window: the R key triggers the reset button and Escape deselects by setting selectedPanel to 0 and redrawing. Say in one sentence what you changed."
echo ---- STEP 5 DONE ----

call %CODEX% exec --dangerously-bypass-approvals-and-sandbox "Step 6. Delete the out folder, run node main.ts with MAKEFUN_OUTPUT_DIR set to out in the same shell, confirm dossier.json and cover.json are written, then say in one sentence what happened."
echo ---- STEP 6 DONE ----