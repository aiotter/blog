import { Site } from "lume/core.ts";
import { setup, tw } from "twind";
import { merge } from "lume/core/utils.ts";
import { HasTarget, virtualSheet } from "twind/sheets";

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
    site.addEventListener("beforeBuild", () => sheet.reset());

    site.addEventListener("afterRender", async () => {
      // write to css file
      const file = await Deno.open(site.dest(options.filePath), {
        create: true,
        write: true,
      });
      const css = (Array.isArray(sheet) ? sheet : (sheet as HasTarget).target)
        .join("");
      await file.write(encoder.encode(css));
      file.close();
    });

    site.process([".html"], (page) => {
      // modify html to link the css file
      if (!page.document) return;
      const styleTag = page.document.createElement("link");
      styleTag.setAttribute("href", options.filePath);
      styleTag.setAttribute("rel", "stylesheet");
      styleTag.setAttribute("type", "text/css");
      page.document.head.appendChild(styleTag);
    });

    site.helper("tw", tw, {type: "tagFunction"});
  };
}
