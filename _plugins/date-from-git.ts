import * as fs from "https://deno.land/std@0.120.0/node/fs.ts";
import * as git from "https://esm.sh/isomorphic-git@1.10.3";
import { Page, Site } from "lume/core.ts";

async function getLastModified(site: Site, page: Page) {
  try {
    const dir = site.src();

    const filepath = (page.src.path.startsWith("/")
      ? page.src.path.slice(1)
      : page.src.path) + (page.src.ext ?? "");

    const commits = (await git.log({
      fs,
      dir,
      filepath,
      follow: true,
    }))
      // Patch a bug on isomorphic-git:
      // prevent accidentally listing up the root branch from merged branch
      .filter((commit, index, array) =>
        !(commit.commit.parent.length === 0 && array.length - 1 > index)
      );

    if (commits.length == 1) return commits[0];

    const targetBlob = await git.readBlob({
      fs,
      dir,
      oid: await git.resolveRef({ fs, dir, ref: "HEAD" }),
      filepath,
    });

    for (const [i, commit] of commits.entries()) {
      const containedOids: string[] = await git.walk({
        fs,
        dir: Deno.cwd(),
        trees: [git.TREE({ ref: commit.oid })],
        map: async (_filename, [entry]) => await entry!.oid(),
      });

      if (!containedOids.includes(targetBlob.oid)) return commits[i - 1];
    }
  } catch (error) {
    if (error instanceof git.Errors.NotFoundError) return undefined;
    throw error;
  }
}

async function getDate(site: Site, page: Page) {
  try {
    const dir = site.src();
    const filepath = (page.src.path.startsWith("/")
      ? page.src.path.slice(1)
      : page.src.path) + (page.src.ext ?? "");

    const commits = await git.log({ fs, dir, filepath, follow: true });
    return commits[-1];
  } catch (error) {
    if (error instanceof git.Errors.NotFoundError) return undefined;
    throw error;
  }
}

async function setLastModified(site: Site, page: Page) {
  const log = await getLastModified(site, page);

  if (log) {
    page.data.lastModified ||= new Date(log.commit.author.timestamp * 1000);
    page.data.commit ||= log.oid;
  }
}

async function setDate(site: Site, page: Page) {
  const log = await getDate(site, page);
  if (log) page.data.date = new Date(log.commit.author.timestamp * 1000);
}

export default function () {
  return (site: Site) => {
    site.preprocess([".html"], setLastModified.bind(null, site));
    site.preprocess([".html"], setDate.bind(null, site));
  };
}
