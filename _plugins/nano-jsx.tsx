/** @jsx Nano.h */
/** @jsxFrag Nano.Fragment */
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="dom.iterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

// You need ...
// - /** @jsx Nano.h */
// - /** @jsxFrag Nano.Fragment */
// - import * as Nano from 'https://deno.land/x/nano_jsx/mod.ts'
// ... at the beginning of every JSX/TSX files.
// If you want to avoid that, insert following code to _config.ts
/*******************************************************************
declare global {
  interface Window {
    React: unknown;
  }
}
window.React ||= { createElement: Nano.h, Fragment: Nano.Fragment };
*******************************************************************/

import * as Nano from "https://deno.land/x/nano_jsx@v0.0.26/mod.ts";
import { DOMParser, Element, Node, NodeType } from "lume/deps/dom.ts";
import { Data, Engine, Helper, Site } from "lume/core.ts";
import moduleLoader from "lume/core/loaders/module.ts";
import { getImportMap, ImportMap, merge } from "lume/core/utils.ts";

function isGeneratorFunction(content: unknown) {
  if (typeof content !== "function") {
    return false;
  }
  const name = content.constructor.name;
  return (name === "GeneratorFunction" || name === "AsyncGeneratorFunction");
}

// patch of unimplemented function
function createDocumentFragment(html: string) {
  const doc = new DOMParser().parseFromString(`<html/>`, "text/html")!;
  const div = doc.createElement("div");
  div.innerHTML = html;
  return div;
}

// Export client side JavaScript
export async function clientSideScriptLoader(
  importMap: URL | ImportMap | undefined,
  path: string,
): Promise<Data> {
  const importMapPath = importMap instanceof URL ? importMap : undefined;

  const userImportMap = importMap instanceof URL
    ? await fetch(importMap).then((r) => r.json()) as ImportMap
    : importMap;

  const mergedImportMap = getImportMap({
    imports: {
      nano: "https://deno.land/x/nano_jsx@v0.0.26/mod.ts",
      "nano/jsx-runtime":
        "https://deno.land/x/nano_jsx@v0.0.26/jsx-runtime/index.ts",
      ...userImportMap?.imports,
    },
    ...userImportMap?.scopes,
  }, importMapPath);

  let compileResult;
  try {
    compileResult = await Deno.emit(path, {
      bundle: "classic",
      check: false,
      compilerOptions: {
        jsx: "react-jsx",
        jsxImportSource: "nano",
        target: "es2015",
        module: "es2015",
        // lib: ["dom", "dom.iterable", "deno.ns", "deno.unstable"],
      },
      importMap: mergedImportMap,
      importMapPath: "data:aplication/json,", // no base path
    });
  } catch {
    // We may have jsx pragma;
    // retry without jsx-related compiler options
    compileResult = await Deno.emit(path, {
      bundle: "classic",
      check: false,
      compilerOptions: {
        target: "es2015",
        module: "es2015",
        // lib: ["dom", "dom.iterable", "deno.ns", "deno.unstable"],
      },
      importMap: mergedImportMap,
      importMapPath: "data:aplication/json,", // no base path
    });
  }

  let { diagnostics, files: { "deno:///bundle.js": content } } = compileResult;

  // Ignore TS5089:
  // Option 'jsxFactory' / 'jsxFragmentFactory' cannot be specified when option 'jsx' is 'react-jsx'.
  diagnostics = diagnostics.filter((diagnostic) => diagnostic.code !== 5089);

  if (diagnostics.length > 0) {
    console.error(`Diagnostics of file "${path}":`);
    console.error(Deno.formatDiagnostics(diagnostics));
  }

  return { content };
}

/**
 * returns all the text nodes with value "\n"
 */
function getNewLineTextNodes(node: ChildNode | Node) {
  let retval: ChildNode[] = [];
  for (
    node = node.firstChild as ChildNode;
    node;
    node = node.nextSibling as ChildNode
  ) {
    if (node.nodeType === NodeType.TEXT_NODE && node.nodeValue === "\n") {
      retval.push(node as ChildNode);
    } else {
      retval = retval.concat(getNewLineTextNodes(node));
    }
  }
  return retval;
}

export class NanoJsxEngine implements Engine {
  helpers: Record<string, Helper> = {};

  deleteCache() {}

  addHelper(name: string, fn: Helper) {
    this.helpers[name] = fn;
  }

  render(
    content: Nano.Component | Nano.FC | AsyncGeneratorFunction,
    data?: Data,
  ): unknown {
    // Create dummy data for data-less rendering
    if (!data) {
      data = { content };
    }

    if (isGeneratorFunction(content)) {
      // deno-lint-ignore no-this-alias
      const nanoEngine = this;
      return (async function* (generator: AsyncGeneratorFunction) {
        for await (const data of generator() as AsyncGenerator<Data>) {
          const content = await nanoEngine.render(
            data.content as Nano.Component,
            data,
          );
          yield { content, ...data };
        }
      })(content as AsyncGeneratorFunction);
    }

    if (!data.children && typeof data.content === "string") {
      // we are rendering layout:
      //   typeof content is function and typeof data.content is string
      const doc = createDocumentFragment(data.content);

      // remove all the text nodes with value "\n"
      getNewLineTextNodes(doc).forEach((node) => node.remove());

      const elements = Array.from(doc.childNodes)
        .filter((node) => node.nodeType === NodeType.ELEMENT_NODE) as Element[];
      elements.forEach((node) =>
        node.toString = () => (node as Element).outerHTML
      );
      data.children = elements;
    }

    // Set helpers property
    for (const [name, helper] of Object.entries(this.helpers)) {
      data[name] ||= helper;
    }

    data.children ||= data.content;

    const { children, ...props } = data;
    const element = () =>
      Nano.h(content, props, ...[
        Array.isArray(children) ? children : [children],
      ]);
    element.toString = () => Nano.renderSSR(element);
    return element;
  }

  renderSync(content: Nano.Component | Nano.FC, data: Data) {
    return (this.render(content as Nano.Component | Nano.FC, data) as Nano.FC)
      .toString();
  }
}

export interface Options {
  /** The list of extensions this plugin applies to */
  extensions: string[] | {
    pages: string[];
    components: string[];
    scripts: string[];
  };
  importMap?: URL | ImportMap;
}

// Default options
export const defaults: Options = {
  extensions: {
    pages: [".jsx", ".tsx"],
    components: [".jsx", ".tsx"],
    scripts: [".client.jsx", ".client.tsx"],
  },
};

export default function (userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);
  const extensions = Array.isArray(options.extensions)
    ? {
      pages: options.extensions,
      components: options.extensions,
      scripts: options.extensions,
    }
    : options.extensions;

  return (site: Site) => {
    const nanoEngine = new NanoJsxEngine();
    site.loadPages(extensions.pages, moduleLoader, nanoEngine);
    site.loadComponents(extensions.components, moduleLoader, nanoEngine);
    site.loadAssets(
      extensions.scripts,
      clientSideScriptLoader.bind(null, options.importMap),
    );
    site.process(extensions.scripts, (page) => page.dest.ext = ".js");
  };
}
