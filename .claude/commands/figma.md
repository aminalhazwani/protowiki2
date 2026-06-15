---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(npm run:*), mcp__Claude_Preview__preview_start, mcp__Claude_Preview__preview_screenshot, mcp__Claude_Preview__preview_snapshot, mcp__Claude_Preview__preview_inspect, mcp__Claude_Preview__preview_eval
argument-hint: [figma-url]
description: Build a Figma design into code and verify the implementation
---

# Build Figma Design

Build and verify this Figma design: $ARGUMENTS

---

## Prerequisites Check

Before starting, verify both required services are available:

1. **Figma MCP** -- Call `get_screenshot` with the node ID from the provided URL. If it fails:
   - Open the Figma desktop app and switch to Dev Mode (bottom toolbar)
   - In the right sidebar under "Inspect", click "Set up Figma MCP"
   - Select "Claude Code", copy the command, and run it in terminal
   - Restart Claude Code
2. **Dev server** -- Call `preview_start` with name `"dev"` to start the Vite dev server (port 5173, configured in `.claude/launch.json`).

---

## Phase A: Design Extraction

1. Extract the node ID and file key from the Figma URL:
   - `figma.com/design/fileKey/fileName?node-id=123-456` -> nodeId is `123:456`, fileKey is `fileKey`
   - Replace `-` with `:` in the node ID

2. Use Figma MCP to fetch design data:
   - `get_design_context` for layout, colors, typography, and reference code
   - `get_screenshot` for visual reference
   - `get_variable_defs` to extract Figma variables

3. Extract key design properties:
   - Layout structure (flexbox, grid, positioning)
   - Colors (hex values -- will be mapped to Codex tokens below)
   - Typography (font family, size, weight, line height)
   - Spacing (padding, margins, gaps)
   - Components and their hierarchy

4. Map Figma values to Codex design tokens. Always prefer tokens over hardcoded values:
   - Colors: `#36c` -> `var(--color-progressive)`, `#202122` -> `var(--color-base)`, `#72777d` -> `var(--color-subtle)`, `#fff` -> `var(--background-color-base)`
   - Spacing: `8px` -> `var(--spacing-50)`, `12px` -> `var(--spacing-75)`, `16px` -> `var(--spacing-100)`, `24px` -> `var(--spacing-150)`
   - Typography: system sans-serif -> `var(--font-family-system-sans)`, serif -> `var(--font-family-serif)`
   - Font sizes: `var(--font-size-small)`, `var(--font-size-medium)`, `var(--font-size-large)`, `var(--font-size-x-large)`, `var(--font-size-xx-large)`
   - Line heights: matching `var(--line-height-*)` tokens
   - Font weight: `700` -> `var(--font-weight-bold)`
   - Borders: `1px solid #a2a9b1` -> `var(--border-base)` or `var(--border-subtle)`
   - Border radius: `var(--border-radius-base)`, `var(--border-radius-sharp)`
   - If no matching token exists, use the raw value with a comment noting it

---

## Phase B: Implementation

1. Determine the target file:
   - New components: `src/components/ComponentName.vue`
   - New views: `src/views/ViewName.vue`
   - Composables (shared logic): `src/composables/useFeatureName.js`
   - Configuration: `src/config/configName.js`
   - If modifying an existing component, edit it in place

2. **Search for existing components** before writing new code:
   - `src/components/` -- project components (CdxToolbar, TextEditor, EditorRail, OutlinePopover, OutlineAccordionList, SettingsDialog)
   - `@wikimedia/codex` -- Codex design system (CdxButton, CdxDialog, CdxAccordion, CdxCard, CdxPopover, CdxIcon, CdxLabel, CdxRadio, CdxField, CdxTextInput, CdxSelect, CdxCheckbox, CdxToggleSwitch, etc.)

3. **Use Codex icons** -- import from `@wikimedia/codex-icons`:

   ```js
   import { cdxIconAdd, cdxIconClose } from '@wikimedia/codex-icons'
   ```

   Search available icons with `Grep` in `node_modules/@wikimedia/codex-icons/`. Never create custom SVG icons.

4. Write the Vue 3 Single File Component:
   - Use `<script setup>` (Composition API)
   - Use `<style scoped>` with Codex design token CSS custom properties
   - No semicolons, single quotes, 2-space indentation
   - Import Codex components: `import { CdxButton, CdxIcon } from '@wikimedia/codex'`
   - Use function declarations for methods
   - Use `ref()`, `computed()`, `watch()` for reactivity
   - Use `defineProps()`, `defineEmits()`, `defineModel()` as needed
   - Use `@/` alias for src-relative imports
   - For spacing, colors, typography: always use Codex design token custom properties instead of hardcoded values

---

## Phase C: Verification Loop

After implementing, verify against the Figma design:

### Step 1: Get the Figma Reference

Use `get_screenshot` with the nodeId to capture the Figma design.

### Step 2: Start the Dev Server

Call `preview_start` with name `"dev"` to launch the Vite dev server.

### Step 3: Capture the Implementation

Use these tools to inspect the result:
- `preview_screenshot` -- visual screenshot for layout comparison
- `preview_snapshot` -- accessibility tree for verifying text content and element structure
- `preview_inspect` -- computed CSS properties for verifying exact colors, spacing, typography, and dimensions

### Step 4: Compare Side by Side

Analyze the Figma design against the implementation. Check in this order:

1. **Structure** -- Is the component hierarchy correct? (use `preview_snapshot`)
2. **Layout** -- Flexbox/grid direction, alignment, justification
3. **Spacing** -- Padding, margins, gaps (verify with `preview_inspect` against Codex tokens)
4. **Sizing** -- Width, height constraints
5. **Colors** -- Background, text, borders (verify computed values match Codex design tokens)
6. **Typography** -- Font size, weight, line height (verify against `--font-size-*`, `--font-weight-*`, `--line-height-*`)
7. **Borders** -- Width, radius, color
8. **Shadows** -- Box shadows, drop shadows

### Step 5: Fix and Repeat

1. Make targeted code changes to fix discrepancies
2. Take a new screenshot with `preview_screenshot`
3. Compare again
4. Repeat until implementation matches (or after 3 iterations, ask user for feedback)

---

## Exit Conditions

**Stop iterating when:**

- Implementation closely matches Figma (near pixel-perfect)
- Need clarification from user (hover states, animations, etc.)
- 3 iterations with minimal improvement -- ask user for feedback
