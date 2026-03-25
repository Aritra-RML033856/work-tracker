# Work Tracker Dashboard 🚀

A premium, interactive React-based dashboard for tracking daily work logs. This tool provides a stunning 3D-carousel interface to browse, add, and search work entries, with live synchronization from a published Google Sheet.

## ✨ Key Features

- **🔄 Live Google Sheet Sync**: Automatically fetches and parses data from a published CSV URL. Keeps your logs up-to-date with your spreadsheets.
- **📅 Smart Date Navigation**:
  - **Go to Date Picker**: Search by date with a native picker.
  - **Nearest-Next Matching**: If a selected date has no log (e.g., weekends), the dashboard automatically jumps to the **nearest next available date**.
- **🔒 Strict Constraints**:
  - **Search**: Restricted to current or past dates only.
  - **Creation**: "Add Slide" and "Edit" modals block past-date entries to ensure sequential integrity.
- **🎨 Glassmorphism & 3D Transitions**: A high-fidelity UI with smooth CSS-3D rotations, dynamic scaling, and color-coded themes (Weekly/Monthly palettes).
- **📝 Detailed Views**:
  - **Read More Modal**: Long content (>160 characters) is truncated with a dedicated detail popup.
  - **Local Persistence**: Saves your carousel state and manually added slides to `localStorage`.

## 🛠 Project Structure

- `src/`
  - `components/`
    - `TextCarouselDashboard.jsx`: The core engine, state management, and UI logic.
  - `App.jsx`: Main application wrapper.
  - `main.jsx`: Vite entry point.
  - `index.css`: Tailwind CSS directives and global resets.
- `index.html`: Entry path for the browser.
- `tailwind.config.js`: Configuration for the Tailwind CSS scanning.

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Access the Dashboard**:
   Open [http://localhost:5173/](http://localhost:5173/) (or the port shown in your terminal).

## 📊 Google Sheet Integration

The dashboard is currently linked to:
[Work Logs Google Sheet (CSV Export)](https://docs.google.com/spreadsheets/d/e/2PACX-1vQcahiqDZXfIuW9clbf2XH0UNr7jcL6rOmui7Wn9Q3AkOcq3Fb_SKrxM1QbphTipFh4kmZIES7wsf4f/pub?output=csv)

<!-- To update the data source, modify the `fetchSheetData` URL in `src/components/TextCarouselDashboard.jsx`. -->

## ⚙️ Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
