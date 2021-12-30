import { Data, Site } from "lume/core.ts";
import { merge } from "lume/core/utils.ts";
// import Asciidoctor from "https://esm.sh/asciidoctor@2.2.5";
import { parse } from "https://deno.land/std@0.121.0/encoding/yaml.ts";

const decoder = new TextDecoder();
// export const asciidoctor = Asciidoctor();

export interface Options {
  /** The list of extensions this plugin applies to */
  extensions: string[];
}

// Default options
export const defaults: Options = {
  extensions: [".adoc"],
};

export async function asciidocLoader(path: string): Promise<Data> {
  // const option = {
  //   base_dir: filename,
  // }
  // const document = asciidoctor.convert(content, option);
  // ...

  const process = Deno.run({
    cmd: ["asciidoctor", "--out-file=-", "--embedded", "-v", path],
    stdout: "piped",
  });
  const content = decoder.decode(await process.output());
  const data: Data = {content};

  // Set attributes to data
  const text = await Deno.readTextFile(path);
  for (const [i, line] of text.split("\n").entries()) {
    if (line === "") break;
    if (line.startsWith(":")) {
      const [, rawAttribute, rawValue] = line.split(":");
      const attribute = (rawAttribute.startsWith("page-")) ? rawAttribute.slice(5) : rawAttribute;
      const value = parse(rawValue);
      data[attribute] = value;
    } else if (i === 2) {
      data.author = line;
    }
  }
  return data;
}

export default function (userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);

  return (site: Site) => {
    site.loadPages(options.extensions, asciidocLoader);
  };
}
