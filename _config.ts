import lume from "lume/mod.ts";

export const repository = {
  url: "https://github.com/aiotter/blog",
  branch: "master",
};

import footnote from "https://jspm.dev/markdown-it-footnote@3.0.3";
const site = lume({
  location: new URL("https://aiotter.com"),
}, {
  markdown: {
    plugins: [footnote],
    keepDefaultPlugins: true,
  },
});

const md = site.formats.get(".md")!.engine;
// @ts-ignore: no type information
md.engine.renderer.rules.footnote_block_open = () => (
  '<section class="footnotes" data-footnotes>' +
  '<h2 class="sr-only" id="footnote-label">Footnotes</h2>' +
  '<ol class="list-decimal list-outside">'
);
// @ts-ignore: no type information
md.engine.renderer.rules.footnote_block_close = () => (
  "</ol></section>"
);
// @ts-ignore: no type information
md.engine.renderer.rules.footnote_caption = (tokens, idx) => {
  let n = Number(tokens[idx].meta.id + 1).toString();
  if (tokens[idx].meta.subId > 0) {
    n += ":" + tokens[idx].meta.subId;
  }
  return n;
};

import codeHighlight from "lume/plugins/code_highlight.ts";
site.use(codeHighlight());

import resolveUrls from "lume/plugins/resolve_urls.ts";
site.use(resolveUrls());

import slugifyUrls from "lume/plugins/slugify_urls.ts";
site.use(slugifyUrls());

import svgo from "lume/plugins/svgo.ts";
site.use(svgo());

import terser from "lume/plugins/terser.ts";
site.use(terser());

import nanoJsx from "plugins/nano-jsx.tsx";
site.use(nanoJsx({ importMap: new URL("import_map.json", import.meta.url) }));

import dateFromGit from "plugins/date-from-git.ts";
site.use(dateFromGit());

import asciidoc from "plugins/asciidoctor-js.ts";
site.use(asciidoc());

import windicss from "plugins/windicss.ts";
site.use(windicss({
  config: {
    theme: {
      extend: { fontFamily: { awesome: ['"Font Awesome 5 Free"'] } },
    },
    shortcuts: {
      "bg-shadow": "rounded inset-0 bg-teal-200 opacity-25 -z-1",
      "metadata": "text-warm-gray-600",
    },
  },
  css: [
    "h1, h2, h3, h4, h5, h6 { @apply mt-[24px] mb-[16px] pb-[.3em] font-semibold }",
    "h1 { @apply text-4xl }",
    "h2 { @apply text-3xl }",
    "h3 { @apply text-2xl }",
    "h4 { @apply text-xl }",
    "h5 { @apply text-lg }",
  ],
}));

import sass from "plugins/sass.ts";
site.use(sass());

// Auto generate CSS files
import moduleLoader from "lume/core/loaders/module.ts";
site.loadAssets([".css.ts"], moduleLoader);
site.process([".css.ts"], (page) => page.dest.ext = ".css");

import autoTitle from "plugins/auto-title.ts";
site.use(autoTitle());

site.loadAssets([".css"]);

export default site;
