# DDLSetupMarket — Standalone Windows Desktop App (.exe) Guide

This guide explains how to export this application from Google AI Studio and build a standalone Windows executable (`.exe`) installer or portable app.

---

## 1. Export / Download Project Files from AI Studio

1. In the Google AI Studio interface, click the **Settings / Menu** icon (or top-right corner actions).
2. Choose **Export to ZIP** (or **Export to GitHub**).
3. Save the ZIP file to your local computer and extract it to a folder (e.g., `C:\Projects\DDLSetupMarket`).

---

## 2. Option A: Build with Electron (Pre-Configured & Ready)

The project includes pre-configured Electron configuration (`electron/main.cjs`, `electron/preload.cjs`, and `electron-builder` in `package.json`).

### Prerequisites
- Install **Node.js (v18 or v20+)**: [https://nodejs.org](https://nodejs.org)

### Step-by-Step Build Instructions

1. Open PowerShell or Command Prompt in the extracted project directory:
   ```bash
   cd C:\Projects\DDLSetupMarket
   ```

2. Install dependencies (including Electron and electron-builder):
   ```bash
   npm install
   npm install --save-dev electron electron-builder
   ```

3. **Test in Desktop Window (Development Mode)**:
   ```bash
   npm run build
   npm run electron:start
   ```

4. **Generate the Standalone Windows Executable (.exe)**:
   - To create a standard Windows installer (`.exe` with setup wizard & desktop shortcut):
     ```bash
     npm run package:win
     ```
   - To create a single standalone portable executable (`.exe` without installation required):
     ```bash
     npm run package:win:portable
     ```

5. **Locate your `.exe` file**:
   - Check the generated **`release/`** folder:
     - `release/DDLSetupMarket Setup 1.0.0.exe` (Installer)
     - `release/DDLSetupMarket 1.0.0.exe` (Portable Single-File Executable)

---

## 3. Option B: Build with Tauri (Lightweight Alternative)

If you prefer an ultra-lightweight binary (~10MB footprint using Windows WebView2):

1. Install Rust: [https://rustup.rs/](https://rustup.rs/)
2. In the project root, run:
   ```bash
   npm install --save-dev @tauri-apps/cli
   npx tauri init
   ```
   - When prompted:
     - App name: `DDLSetupMarket`
     - Window title: `DDLSetupMarket`
     - Web assets: `../dist`
     - Dev server URL: `http://localhost:3000`
3. Build the Windows `.exe` installer:
   ```bash
   npm run build
   npx tauri build
   ```
4. Find the `.exe` in `src-tauri/target/release/bundle/msi/` or `nsis/`.

---

## 4. Desktop Features & Compatibility Notes

- **Persistent State**: User logins, ratings, favorites, and custom submitted setups are safely persisted inside the native desktop environment using the local Windows application storage.
- **Export Sheets**: PNG spec sheet and clipboard exports work out of the box.
- **Offline Capable**: All preset setups for F1 24, F1 25, and F1 26 are bundled directly into the executable and run without needing an active internet connection.
