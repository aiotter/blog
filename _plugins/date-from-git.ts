import * as fs from "https://deno.land/std@0.120.0/node/fs.ts";
import * as git from "https://esm.sh/isomorphic-git@1.10.3";
import { Page, Site } from "lume/core.ts";

async function getCommits(site: Site, page: Page) {
  const dir = site.src();

  const filepath =
    (page.src.path.startsWith("/") ? page.src.path.slice(1) : page.src.path) +
    (page.src.ext ?? "");

  const commits = await git.log({ fs, dir, filepath, follow: true })
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

  const created = commits.slice(-1).pop() as git.ReadCommitResult | undefined;
  if (commits.length == 1) return { created, lastModified: undefined };

  try {
    const headOid = await git.resolveRef({ fs, dir, ref: "HEAD" });
    const targetBlob = await git.readBlob({ fs, dir, oid: headOid, filepath });

    for (const [i, commit] of commits.entries()) {
      const containedOids: string[] = await git.walk({
        fs,
        dir: Deno.cwd(),
        trees: [git.TREE({ ref: commit.oid })],
        map: async (_filename, [entry]) => await entry!.oid(),
      });

      if (!containedOids.includes(targetBlob.oid)) {
        return { created, lastModified: commits[i - 1] };
      }
    }
    return { created, lastModified: undefined };
  } catch (error) {
    if (error instanceof git.Errors.NotFoundError) {
      return { created, lastModified: undefined };
    }
    throw error;
  }
}

export interface Options {
  /** The list of extensions this plugin applies to */
  extensions: string[];
  /** Overwrite created date */
  overwrite: boolean;
}

export const defaults: Options = {
  extensions: [".html"],
  overwrite: true,
}

async function setDates(site: Site, options: Options, page: Page) {
  const { created, lastModified } = await getCommits(site, page);

  if (options.overwrite && created) {
    page.data.date = new Date(created.commit.author.timestamp * 1000);
    page.data.createdCommit = created;
  }

  if (lastModified) {
    page.data.lastModified ||= new Date(
      lastModified.commit.author.timestamp * 1000,
    );
    page.data.lastModifiedCommit = lastModified;
  }
}

export default function (userOptions?: Partial<Options>) {
  const options = {...defaults, ...userOptions};
  return (site: Site) => {
    site.preprocess(options.extensions, setDates.bind(null, site, options));
  };
}
