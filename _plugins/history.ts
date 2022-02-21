import * as fs from "https://deno.land/std@0.120.0/node/fs.ts";
import * as git from "https://esm.sh/isomorphic-git@1.10.3";
import { Page, Site } from "lume/core.ts";

async function getCommits(site: Site, page: Page) {
  const dir = site.src();

  const filepath =
    (page.src.path.startsWith("/") ? page.src.path.slice(1) : page.src.path) +
    (page.src.ext ?? "");

  return await git.log({ fs, dir, filepath, follow: true })
    .then((commits) =>
      // Patch a bug on isomorphic-git:
      // prevent accidentally listing up the root branch of merged branch
      commits.filter((commit, index, array) =>
        !(commit.commit.parent.length === 0 && array.length - 1 > index)
      )
    )
    .catch((error) => {
      if (error instanceof git.Errors.NotFoundError) return [];
      throw error;
    });
}

export interface Options {
  /** The list of extensions this plugin applies to */
  extensions: string[];
  /** Key of the data structure to store the history */
  key: string;
}

export const defaults: Options = {
  extensions: [".html"],
  key: "history",
};

async function setHistory(site: Site, options: Options, page: Page) {
  const commits = await getCommits(site, page);

  if (commits.length > 0) {
    page.data[options.key] ||= commits;
  }
}

function writeOutHistory(page: Page) {
  if (!page.document || !page.data.history) return;

  const history = page.document.createElement("script");
  history.setAttribute("type", "application/json");
  history.setAttribute("id", "history");
  history.innerText = JSON.stringify(
    page.data.history as git.ReadCommitResult[],
  );
  page.document.head.appendChild(history);
}

export default function (userOptions?: Partial<Options>) {
  const options = { ...defaults, ...userOptions };
  return (site: Site) => {
    site.preprocess(options.extensions, setHistory.bind(null, site, options));
    site.process(options.extensions, writeOutHistory);
  };
}
