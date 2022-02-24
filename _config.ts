import lume from "lume/mod.ts";
import { sort } from "meta";

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

import nanoJsx, { NanoJsxEngine } from "plugins/nano-jsx.tsx";
site.use(nanoJsx({ importMap: new URL("import_map.json", import.meta.url) }));

import mdx from "plugins/mdx.ts";
import * as runtime from "nano/jsx-runtime";
site.use(
  mdx({
    mdxOptions: { ...runtime, useDynamicImport: true },
    jsxEngine: new NanoJsxEngine(),
  }),
);

import dateFromGit from "plugins/date-from-git.ts";
site.use(dateFromGit());

import history from "plugins/history.ts";
site.use(history());

import asciidoc from "plugins/asciidoctor-js.ts";
site.use(asciidoc());

import tailwindcss from "plugins/tailwindcss.ts";
site.use(tailwindcss());

import sass from "https://raw.githubusercontent.com/lumeland/experimental-plugins/main/sass/sass.ts";
site.use(sass());

// Auto generate CSS files
import moduleLoader from "lume/core/loaders/module.ts";
site.loadAssets([".css.ts"], moduleLoader);
site.process([".css.ts"], (page) => page.dest.ext = ".css");

import autoTitle from "plugins/auto-title.ts";
site.use(autoTitle());

site.preprocess(
  "*",
  (page) => page.data.sourceFile = page.src.path + page.src.ext ?? "",
);

site.preprocess(
  "*",
  (page) => page.data.tags = page.data.tags?.map((tag) => tag.toLowerCase()),
);

// Set collection-page type for pages which use "collection" layout
site.preprocess([".html"], (page) => {
  if (
    page.data.layout === "layouts/collection.tsx" ||
    page.data.type === "collection"
  ) {
    page.data.type = "collection";

    const collectionPages = [...page.parent!.pages.values()]
      .filter((page) => page.data.type !== "collection")
      .sort(sort.pages.dateDescending);
    const newestPage = collectionPages[0];

    page.data.lastModified = newestPage.data.lastModified;

    // Set collection-page type for pages in the same directory as collection page
    collectionPages.forEach((collectionPage) => {
      collectionPage.data.type = "collection-page";
      collectionPage.data.collection = page.data.sourceFile;
    });
  }
});

site.loadAssets([".css"]);

export default site;
