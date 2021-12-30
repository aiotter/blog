import { Data, Site } from "lume/core.ts";
import { merge } from "lume/core/utils.ts";
import { parse } from "https://deno.land/std@0.121.0/encoding/yaml.ts";

export interface Options {
  /** The list of extensions this plugin applies to */
  extensions: string[];
}

// Default options
export const defaults: Options = {
  extensions: [".adoc"],
};

export async function asciidocLoader(path: string): Promise<Data> {
  // Set attributes to data
  const rawContent = await Deno.readTextFile(path);
  const content = `
        <div id="asciidoc-container">Rendering content...</div>
        <script>
          var asciidoc = Asciidoctor();
          document.getElementById("asciidoc-container").innerHTML = asciidoc.convert(document.getElementById("asciidoc-content").innerText);
        </script>`;
  const data: Data = { content, rawContent };
  for (const [i, line] of rawContent.split("\n").entries()) {
    if (line === "") break;
    if (line.startsWith(":")) {
      const [, rawAttribute, rawValue] = line.split(":");
      const attribute = (rawAttribute.startsWith("page-"))
        ? rawAttribute.slice(5)
        : rawAttribute;
      const value = parse(rawValue);
      data[attribute] = value;
    } else if (i === 0) {
      data.title = line.match(/^\s*=+\s(.+)(\s*=\s*)?$/)?.[1];
    } else if (i === 1) {
      data.author = line;
    }
  }
  data.title ||= data.doctitle;
  return data;
}

export default function (userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);

  return (site: Site) => {
    site.loadPages(options.extensions, asciidocLoader);
    site.process(options.extensions, (page) => {
      const asciidocScript = page.document!.createElement("script");
      asciidocScript.setAttribute(
        "src",
        "https://unpkg.com/@asciidoctor/core@2.2.6/dist/browser/asciidoctor.js",
      );
      page.document!.head.appendChild(asciidocScript);

      const contentScript = page.document!.createElement("script");
      contentScript.setAttribute("type", "text/asciidoc");
      contentScript.setAttribute("id", "asciidoc-content");
      contentScript.innerText = page.data.rawContent as string;
      page.document!.head.appendChild(contentScript);
    });
  };
}
