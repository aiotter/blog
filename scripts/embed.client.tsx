/** @jsxImportSource nano */

import { Embed } from "components/embed.tsx";
import { hydrate } from "nano";

// deno-lint-ignore no-window-prefix
window.addEventListener("load", () => {
  Array.from(window.document.getElementsByTagName("p"))
    .map((p) => {
      if (p.childElementCount !== 1 || p.children.item(0)?.tagName !== "A") {
        return null;
      }
      const a = p.getElementsByTagName("a").item(0)!;
      if (a.getAttribute("href") === a.innerHTML) return a;
    })
    .filter(Boolean)
    .map(async (a) => {
      const url = new URL(
        location.protocol + "//" + location.host + "/api/embed",
      );
      url.searchParams.set("url", a!.href);
      const ogp = await fetch(url.href).then((r) => r.json());
      if (ogp) {
        hydrate(<Embed ogp={ogp as Parameters<typeof Embed>[0]["ogp"]} />, a!);
        a!.classList.add("no-underline");
      }
    });
});
