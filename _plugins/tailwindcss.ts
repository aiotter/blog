import { Site } from "lume/core.ts";
import { merge } from "lume/core/utils.ts";
import { copy } from "https://deno.land/std@0.126.0/streams/conversion.ts";

export interface Options {
  extensions: string[];

  /** Config file path */
  config?: string;
}

// Default options
export const defaults: Options = {
  extensions: [".tailwind.css"],
};

async function buildCss(
  site: Site,
  configPath: string | undefined,
  path: { input: string; output: string },
) {
  const runOption = {
    cmd: ["tailwindcss", "--minify", "-i", site.src(path.input)],
    stdout: "piped" as const,
  };
  if (configPath) runOption.cmd.push("--config", configPath);
  const process: Deno.Process<typeof runOption> = Deno.run(runOption);

  const file = await Deno.open(site.dest(path.output), { write: true });
  await copy(process.stdout, file);
  file.close();

  const status = await process.status();
  if (!status.success) {
    throw new Error(`Tailwind CSS CLI exited with ${status.code}`);
  }
}

export default function (userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);
  return (site: Site) => {
    site.loadAssets(options.extensions);
    site.process(options.extensions, (page) => page.dest.ext = ".css");

    // Insert Tailwind CSS's Play CDN to every HTML page in development mode
    site.process([".html"], (page) => {
      if (!site.options.dev || !page.document) return;
      const tailwindScript = page.document.createElement("script");
      tailwindScript.setAttribute("src", "https://cdn.tailwindcss.com");
      page.document.head.appendChild(tailwindScript);
      const tailwindConfigScript = page.document.createElement("script");
      tailwindConfigScript.innerHTML =
        "tailwind.config = { corePlugins: { preflight: false } };";
      page.document.head.appendChild(tailwindConfigScript);
    });

    const eventHander = () =>
      site.pages
        .filter((page) => options.extensions.includes(page.src.ext!))
        .forEach((page) =>
          buildCss(site, options.config, {
            input: page.src.path + page.src.ext,
            output: page.dest.path + page.dest.ext,
          })
        );
    site.addEventListener("afterBuild", eventHander);
    site.addEventListener("afterUpdate", eventHander);
    site.ignore(options.config ?? "tailwind.config.js");
  };
}
