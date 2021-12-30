// import { Page } from "lume/core.ts";
// import { dirname, relative } from "std/path/mod.ts";
// import site from "site";

// All posts in this directory will be built to `_site/${filename}/index.html`
// export function url(page: Page) {
//   const thisFileDir = dirname(new URL(import.meta.url).pathname);
//   const path = relative(thisFileDir, site.src(page.src.path));
//   return `/${path}/`;
// }

export const type = "post";
export const layout = "layouts/post.tsx";
