import { Data as BaseData } from "lume/core.ts";
import { ReadCommitResult } from "https://esm.sh/isomorphic-git@1.10.3";

export interface Data extends BaseData {
  title?: string;
  lastModified?: Date;
  lastModifiedCommit?: ReadCommitResult;
  createdCommit?: ReadCommitResult;
  type?: "post" | "tag";
  /** Only for tag page */
  tag?: string;
  /** Path of source file */
  sourceFile: string;
  /** History */
  history?: ReadCommitResult[];
}
