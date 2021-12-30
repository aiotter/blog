import { Site } from "lume/core.ts";
import { merge } from "lume/core/utils.ts";
import { Processor } from "https://esm.sh/windicss@3.4.3/lib";
// import { baseConfig } from "https://esm.sh/windicss@3.4.3/config";
import { defineConfig } from "https://esm.sh/windicss@3.4.3/helpers";
import {
  CSSParser,
  HTMLParser,
} from "https://esm.sh/windicss@3.4.3/utils/parser";

export { default as plugin } from "https://esm.sh/windicss@3.4.3/plugin";

const encoder = new TextEncoder();

export interface Options {
  /** Config object of windicss */
  config?: Parameters<typeof defineConfig>[0];

  /** file name of the creating stylesheet */
  filePath: string;

  /** Additional CSS to add */
  // css?: string | Record<string, Record<string, unknown>>;
  css?: string | string[];
}

// Default options
export const defaults: Options = {
  filePath: "/style.css",
};

export default function (userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);
  const processor = new Processor(
    options.config && defineConfig(options.config),
  );

  return (site: Site) => {
    async function writeOutCss() {
      const htmlClasses = site.pages
        .filter((page) => typeof page.content === "string")
        .map((page) =>
          new HTMLParser(page.content as string)
            .parseClasses()
            .map((i: { result: string }) => i.result)
        ).flat();

      const preflightSheet = processor.preflight();
      const interpretedSheet =
        processor.interpret(htmlClasses.join(" ")).styleSheet;

      // Convert css object to string
      // const css = (typeof options.css === "object")
      //   ? Object.entries(options.css).map(([k, v]) =>
      //     k + "{" +
      //     Object.entries(v)
      //       .map((i) => i.join(k.startsWith("@") ? ":" : " "))
      //       .join(";") +
      //     "}"
      //   ).join("")
      //   : options.css;
      const css = Array.isArray(options.css)
        ? options.css.join("")
        : options.css;
      const additionalSheet = new CSSParser(css, processor).parse();

      const APPEND = true;
      const MINIFY = true;
      const styles = interpretedSheet
        .extend(preflightSheet, APPEND)
        .extend(additionalSheet, APPEND)
        .build(MINIFY);

      // write to css file
      const file = await Deno.open(site.dest(options.filePath), {
        append: true,
        create: true,
      });
      await file.write(encoder.encode(styles));
      file.close();
    }
    site.addEventListener("afterBuild", writeOutCss);
    site.addEventListener("afterUpdate", writeOutCss);

    site.process([".html"], (page) => {
      // Preprocess the HTML class names
      // FIXME: Does not work for generated HTML (/tags/tag/index.html)
      if (!page.document) return;
      page.document.getElementsByTagName("*")
        .forEach((element) => {
          const classNames = element.getAttribute("class");
          if (!classNames) return;
          const { success, ignored } = processor.interpret(classNames);
          const interpretedClassNames = [...success, ...ignored].join(" ");
          element.setAttribute("class", interpretedClassNames);
        });

      // Modify html to link the css file
      const styleTag = page.document.createElement("link");
      styleTag.setAttribute("type", "text/css");
      styleTag.setAttribute("rel", "stylesheet");
      styleTag.setAttribute("href", options.filePath);
      page.document.head.appendChild(styleTag);
    });
  };
}
