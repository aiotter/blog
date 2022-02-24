import * as fs from "https://deno.land/std@0.120.0/node/fs.ts";
import * as git from "https://esm.sh/isomorphic-git@1.10.3";

export const repository = {
  url: "https://github.com/aiotter/blog",
  branch: await git.currentBranch({ fs, dir: Deno.cwd() }) as string,
};
