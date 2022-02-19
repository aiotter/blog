import { evaluate } from "https://esm.sh/@mdx-js/mdx@v2.0.0?pin=v66&alias=astring:https://deno.land/x/astring@v1.8.1/src/astring.js";
import type { Data, Engine, Site } from "lume/core.ts";
import textLoader from "lume/core/loaders/text.ts";

type EvaluateOptions = Parameters<typeof evaluate>[1];

export interface Options {
  /** The list of extensions this plugin applies to */
  extensions?: string[] | {
    pages: string[];
    components: string[];
  };
  mdxOptions: EvaluateOptions;
  jsxEngine: Engine;
}

// Default options
export const defaults: Partial<Options> = {
  extensions: [".mdx"],
};

export async function mdxLoader(
  options: EvaluateOptions,
  path: string,
): Promise<Data> {
  const data = await textLoader(path);
  const { default: content, ...additionalData } = {
    ...await evaluate(data.content as string, options),
  };
  return { ...data, ...additionalData, content };
}

/** Register the plugin to support MDX files */
export default function (userOptions: Options) {
  const options = { ...defaults, ...userOptions } as Required<Options>;

  const extensions = Array.isArray(options.extensions)
    ? { pages: options.extensions, components: options.extensions }
    : options.extensions;

  return (site: Site) => {
    site.loadPages(
      extensions.pages,
      mdxLoader.bind(null, options.mdxOptions),
      options.jsxEngine,
    );
    site.loadComponents(
      extensions.components,
      mdxLoader.bind(null, options.mdxOptions),
      options.jsxEngine,
    );
  };
}
