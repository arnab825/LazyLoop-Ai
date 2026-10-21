# UI/UX Specification — LazyLoop AI

## 1. Design System: Warm Light Neo-Brutalism

LazyLoop AI adheres strictly to a **Light-Themed Neo-Brutalist** aesthetic. It delivers ultra-high contrast, distinct tactical feedback, and complete legibility without relying on dark mode or generic minimalism.

### 1.1 Aesthetic Pillars
- **Warm Canvas:** Rich off-white / cream backdrop (`#FAF8F5`) instead of harsh pure white or dark backgrounds. No background dots or distracting patterns.
- **Pure Black Outlines & Borders:** Solid `2px` or `3px` black borders (`#000000`) defining all functional boundaries, cards, buttons, badges, and modals.
- **Hard Drop Shadows:** Distinct geometric drop shadows with 0px blur:
  - Extra Small (`--shadow-brutal-xs`): `2px 2px 0px #000000`
  - Small (`--shadow-brutal-sm`): `3px 3px 0px #000000`
  - Standard (`--shadow-brutal`): `4px 4px 0px #000000`
  - Large (`--shadow-brutal-lg`): `6px 6px 0px #000000`
  - Extra Large (`--shadow-brutal-xl`): `8px 8px 0px #000000`
- **Punchy High-Contrast Accents:** Curated highlighter accents used functionally to convey status and action without visual fatigue.
- **Readable, Clean Typography:** No code-comment prefixes (such as `//`) in user-facing labels or headlines. Clean, natural English with uppercase brutalist headings.

---

## 2. Color Palette & Design Tokens

| Token Name | Hex Code | Role & Usage |
|---|---|---|
| `--bg-canvas` | `#FAF8F5` | Main warm cream application backdrop |
| `--bg-card` / `--bg-sidebar` | `#FFFFFF` | Crisp white surface for cards, sidebar, and inputs |
| `--text-black` / `--text-primary` | `#000000` / `#111827` | Pure high-contrast body & heading text |
| `--text-secondary` | `#4B5563` | Subtitles, descriptions, and supporting metadata |
| `--brutal-yellow` | `#FFE866` | Primary badges, warning urgency, command highlights |
| `--brutal-lime` | `#00FF87` | Success indicators, verified hashes, primary CTA action buttons |
| `--brutal-cyan` | `#38DBFF` | Diagnostic information, latency statistics, secondary actions |
| `--brutal-rose` | `#FF4D6D` | High urgency badges, error states, and unread notification counter |
| `--brutal-purple` | `#B57BFF` | Routine DNA badges and specialty automation states |
| `--brutal-orange` | `#FF9F1C` | Diagnostic warnings and review tags |

---

## 3. Typography Hierarchy

- **Display & Headings:** `Plus Jakarta Sans` (weights: 700, 800, 900) — Bold, geometric, uppercase styling for primary titles and metrics.
- **Monospace & Code Data:** `Space Mono` & `JetBrains Mono` — File paths, hashes, SHA-256 digests, and technical assertions.
- **Body & Captions:** `Plus Jakarta Sans` (weights: 500, 600) — Crisp, legible descriptions with `line-height: 1.5`.

---

## 4. Responsive Breakpoint System

The application provides a responsive layout tailored for Desktop, Tablet, and Mobile devices:

### 4.1 Desktop Viewports (> 1024px)
- **Sidebar:** Fixed 280px left sidebar with quick navigation, workspace perimeter status, and native folder selection.
- **Command Station:** Dual-column hero illustration with 4-column KPI cards and 3-column tailored use-case presets.
- **Notification Dropdown:** Anchored beneath bell button, right-aligned to header action bar.

### 4.2 Tablet Viewports (768px – 1024px)
- **Grid Stacking:** KPI cards adapt to 2-column layouts; use-case cards adapt to 2 columns.
- **Main Padding:** Compacted to `24px 28px` for optimal touchscreen reading.
- **Dropdowns & Modals:** Standardized width with responsive horizontal margins to prevent boundary clipping.

### 4.3 Mobile Viewports (< 768px)
- **Mobile Top Bar:** Persistent sticky header (`mobile-top-bar`) with branding, local status indicator, and `☰` hamburger toggle.
- **Drawer Sidebar:** Slides in as a modal drawer with `z-index: 9999`, semi-transparent backdrop (`.mobile-overlay`), and explicit `✕` close button. Closes automatically upon route selection.
- **Full Stacking:** Command station actions wrap vertically; KPI metrics and findings cards convert to 1-column stacks.
- **Notification Drawer:** Absolutely positioned directly beneath the bell icon, with an internal `✕` button and fluid width (`min(340px, calc(100vw - 32px))`).
- **Touch-Friendly Buttons:** Action buttons stretch to 100% width with min-height of 44px for easy tap targets.

---

## 5. Key Interface Components

1. **Workspace Boundary Card:** Includes native Windows Folder Picker (`window.showDirectoryPicker()` with fallback) and quick manual edit toggle.
2. **Interactive Direct Diagnostics:** "Audit Repo Documentation" and "Run Smart Project Cleanup" open dedicated popovers displaying real-time checks with a direct "Automate with Proof" CTA.
3. **Execution Timeline & Proof Receipts:** Visual steps showing live before/after SHA-256 hashes, status pills, and one-click JSON receipt export.
4. **Procrastination Radar:** Visual hygiene score gauge with categorized urgency badges and immediate automation triggers.
