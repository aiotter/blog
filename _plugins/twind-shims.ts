import { Site } from "lume/core.ts";
import { setup } from "twind";
import { merge } from "lume/core/utils.ts";
import { shim, virtualSheet } from "https://esm.sh/twind@0.16.16/shim/server";

const encoder = new TextEncoder();
const sheet = virtualSheet();
setup({ sheet });

export interface Options {
  /** file name of the creating stylesheet */
  filePath: string;
}

// Default options
export const defaults: Options = {
  filePath: "/style.css",
};

export default function (userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);

  return (site: Site) => {
    async function writeOutCss() {
      sheet.reset();
      const cssSet: Set<string> = new Set();

      // Scan all html
      // We use innerHTML instead of page.content here
      // because shim need a full HTML, not a partial one.
      site.pages.forEach((page) => {
        // @ts-ignore: innerHTML exists in page.document
        page.document && shim(page.document.innerHTML);
        (Array.isArray(sheet) ? sheet : sheet.target)
          .forEach((css: string) => cssSet.add(css));
      });

      // write to css file
      const file = await Deno.open(site.dest(options.filePath), {
        append: true,
        create: true,
      });
      // const css = (Array.isArray(sheet) ? sheet : sheet.target).join("");
      await file.write(encoder.encode(Array.from(cssSet).join("")));
      file.close();
    }

    site.addEventListener("afterBuild", writeOutCss);
    site.addEventListener("afterUpdate", writeOutCss);

    site.process([".html"], (page) => {
      // modify html to link the css file
      if (!page.document) return;
      const styleTag = page.document.createElement("link");
      styleTag.setAttribute("href", options.filePath);
      styleTag.setAttribute("rel", "stylesheet");
      styleTag.setAttribute("type", "text/css");
      page.document.head.appendChild(styleTag);
    });
  };
}
