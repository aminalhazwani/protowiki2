/**
 * Single re-export module for every Tiptap / ProseMirror symbol used by the
 * article-creation prototype.
 *
 * The Vue-integrated exports (`useEditor`, `EditorContent`, `NodeViewWrapper`,
 * `VueNodeViewRenderer`) come from a *locally vendored* copy of
 * `@tiptap/vue-3` (`./tiptap-vue.js`) — that copy was built by esm.sh with
 * `?external=vue` so its `import "vue"` is a bare specifier that Vite resolves
 * to protowiki2's own Vue. Without that, esm.sh would bundle its own Vue and
 * the editor would mount in a *different* Vue instance from the host, breaking
 * reactivity and refs.
 *
 * Everything else (core, pm subpaths, starter-kit, extensions) is
 * framework-agnostic and comes straight from esm.sh, with `?deps=` pinning to
 * keep the @tiptap/core / @tiptap/pm versions consistent across packages.
 *
 * If you bump Tiptap, bump every URL here AND re-fetch tiptap-vue.js:
 *   curl -sS "https://esm.sh/@tiptap/vue-3@<NEW>?external=vue&deps=..."
 *     | follow the redirect to the X-... build path
 *     | sed 's|"/|"https://esm.sh/|g' > tiptap-vue.js
 */

// Vue-integrated exports — vendored locally with external Vue.
export { useEditor, EditorContent, NodeViewWrapper, VueNodeViewRenderer }
  from './tiptap-vue.js'

// @tiptap/core symbols — also re-exported by tiptap-vue.js via `export *`,
// but we point at the bare CDN URL so this module stays explicit about its
// surface. (Both paths reach the same @tiptap/core build.)
export { Node, Extension, mergeAttributes }
  from 'https://esm.sh/@tiptap/core@3.20.0'

// @tiptap/pm subpaths — framework-agnostic.
export { Plugin, PluginKey }
  from 'https://esm.sh/@tiptap/pm@3.20.0/state?deps=@tiptap/core@3.20.0'

export { Decoration, DecorationSet }
  from 'https://esm.sh/@tiptap/pm@3.20.0/view?deps=@tiptap/core@3.20.0'

// @tiptap/starter-kit (default export)
export { default as StarterKit }
  from 'https://esm.sh/@tiptap/starter-kit@3.20.0?deps=@tiptap/core@3.20.0,@tiptap/pm@3.20.0'

// @tiptap/extension-placeholder (default export)
export { default as Placeholder }
  from 'https://esm.sh/@tiptap/extension-placeholder@3.20.0?deps=@tiptap/core@3.20.0,@tiptap/pm@3.20.0'
