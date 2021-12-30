import { Data, Site } from "lume/core.ts";
import { merge } from "lume/core/utils.ts";
import { degrass } from "https://deno.land/x/degrass/mod.ts";
import { readAll } from "std/streams/conversion.ts";

export interface Options {
  /** Set `true` to include the style reset */
  extensions: string[];
}

const defaults: Options = {
  extensions: [".sass", ".scss"],
};

// async function compileSass(text: string): Promise<string> {
//   const { Sass } = await import(
//     "https://deno.land/x/packup@v0.1.12/vendor/sass/mod.ts"
//   );
//   return new Promise((resolve, reject) => {
//     // @ts-ignore: result is unknown type
//     Sass.compile(text, (result) => {
//       if (result.status === 0) {
//         resolve(result.text);
//       } else {
//         reject(new Error(result.message));
//       }
//     });
//   });
// }

// async function sassLoader(path: string): Promise<Data> {
//   const content = await Deno.readTextFile(path);
//   return { content: degrass(content, { format: "compressed" }).str() };
// }

export async function sassLoader(path: string): Promise<Data> {
  const file = await Deno.open(path, { read: true });
  const runOption = {
    cmd: ["sass", "--stdin"/*, "--style=compressed"*/],
    stdin: "piped" as const,
    stdout: "piped" as const,
  };
  const process: Deno.Process<typeof runOption> = Deno.run(runOption);
  await process.stdin.write(await readAll(file));
  file.close();
  process.stdin.close();
  const content = new TextDecoder().decode(await process.output());
  return { content };
}

export default function (userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);

  return (site: Site) => {
    site.loadAssets(options.extensions, sassLoader);
    site.process(options.extensions, (page) => page.dest.ext = ".css");

    // Reconstruct sass only if .sass or .scss files are updated
    // site.scopedUpdates((path) =>
    //   options.extensions.some((ext) => path.endsWith(ext))
    // );
  };
}
