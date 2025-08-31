#!/usr/bin/env node
import { basename } from 'node:path';
import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';

async function fileExists(p) {
    try {
        await stat(p);
        return true;
    } catch {
        return false;
    }
}

async function main() {
    const targetArg = process.argv[2] || process.env.OBSIDIAN_PLUGIN_DIR;
    if (!targetArg) {
        console.error('Usage: node scripts/deploy.mjs <target-plugin-dir>');
        process.exit(1);
    }

    const targetDir = targetArg;
    const folderName = basename(targetDir);

    // Ensure output exists
    const outMain = 'build/prod/main.js';
    const outCss = 'build/prod/styles.css';
    const hasMain = await fileExists(outMain);
    if (!hasMain) {
        console.error('Error: build/prod/main.js not found. Run "npm run build" first.');
        process.exit(1);
    }

    await mkdir(targetDir, { recursive: true });

    // Write manifest with folderName as id to ensure Obsidian loads it under this folder
    const manifestSrc = JSON.parse(await readFile('manifest.json', 'utf8'));
    const manifestOut = { ...manifestSrc, id: folderName };
    await writeFile(`${targetDir}/manifest.json`, JSON.stringify(manifestOut, null, 4), 'utf8');

    await copyFile(outMain, `${targetDir}/main.js`);
    if (await fileExists(outCss)) {
        await copyFile(outCss, `${targetDir}/styles.css`);
    }

    // Optional: copy versions.json if present
    if (await fileExists('versions.json')) {
        await copyFile('versions.json', `${targetDir}/versions.json`);
    }

    console.log(`Deployed to: ${targetDir}`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

