import { Site } from "lume/core.ts";
import { DOMParser } from "lume/deps/dom.ts";

const parser = new DOMParser();

export default function () {
  return (site: Site) => {
    // Get title from the first <h1> tag
    site.preprocess(
      [".md"],
      (page) => {
        const document = parser.parseFromString(
          site.formats.get(".md")!.engine!.render(page.data.content) as string,
          "text/html",
        );

        page.data.title ||= document?.getElementsByTagName("h1")[0]
          ?.textContent;
      },
    );

    // Remove the same <h1> tag for title
    site.process([".md"], (page) => {
      if (!page.document) return;
      const h1 = page.document.getElementsByTagName("h1");
      if (h1.length >= 2 && h1[0].innerHTML === h1[1].innerHTML) {
        h1[1].remove();
      }
    });
  };
}
