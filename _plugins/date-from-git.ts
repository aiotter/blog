import * as fs from "https://deno.land/std@0.120.0/node/fs.ts";
import * as git from "https://esm.sh/isomorphic-git@1.10.3";
import { Page, Site } from "lume/core.ts";

async function getLastModified(site: Site, page: Page) {
  try {
    const [log] = await git.log({
      fs,
      dir: site.src(),
      filepath: (page.src.path.startsWith("/")
        ? page.src.path.slice(1)
        : page.src.path) + (page.src.ext ?? ""),
      depth: 1,
    });
    return log;
  } catch (error) {
    if (error instanceof git.Errors.NotFoundError) {
      return undefined;
    }
    throw error;
  }
}

async function setLastModified(site: Site, page: Page) {
  const log = await getLastModified(site, page);

  if (log) {
    page.data.lastModified ||= new Date(log.commit.author.timestamp);
    page.data.commit ||= log.oid;
  }
}

export default function () {
  return (site: Site) => {
    site.preprocess([".html"], setLastModified.bind(null, site));
  };
}
