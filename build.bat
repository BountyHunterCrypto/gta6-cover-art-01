@echo off
cd /d C:\Games\AutoClicker\test\gta6-cover-art-01
set CODEX=C:\Users\ryanm\AppData\Roaming\npm\codex.cmd

%CODEX% exec --dangerously-bypass-approvals-and-sandbox "Step 1. Read main.ts and app/index.html. In main.ts, right after the out directory is created, add a check that throws a new Error naming the exact missing path if app/index.html or app/fonts/archivo-black.woff2 does not exist. Keep the rest of main.ts as it is. Then say in one sentence what you changed."
echo ---- STEP 1 DONE ----

%CODEX% exec --dangerously-bypass-approvals-and-sandbox "Step 2. In main.ts, after the dossier.json write, add a writeFileSync that writes cover.json beside dossier.json, containing JSON with the three supported post sizes 1080x1080, 1080x1350 and 1920x1080 and the default caption Sunset Heist. Say in one sentence what you changed."
echo ---- STEP 2 DONE ----

%CODEX% exec --dangerously-bypass-approvals-and-sandbox "Step 3. In app/index.html add a Reset button with id reset directly above the export button. Say in one sentence what you changed."
echo ---- STEP 3 DONE ----

%CODEX% exec --dangerously-bypass-approvals-and-sandbox "Step 4. In app/src/main.js wire the reset button: on click set every panel back to img null, zoom 1, x 0, y 0, set the caption back to Sunset Heist, select panel 1 and redraw. Say in one sentence what you changed."
echo ---- STEP 4 DONE ----

%CODEX% exec --dangerously-bypass-approvals-and-sandbox "Step 5. In app/style.css give the reset button a ghost style: transparent background, 2px solid border, same padding as the export button. Say in one sentence what you changed."
echo ---- STEP 5 DONE ----

%CODEX% exec --dangerously-bypass-approvals-and-sandbox "Step 6. Delete the out folder, then run node main.ts with MAKEFUN_OUTPUT_DIR set to out, confirm dossier.json and cover.json are written, and say in one sentence what happened."
echo ---- STEP 6 DONE ----