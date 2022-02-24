import { Data as BaseData } from "lume/core.ts";
import { ReadCommitResult } from "https://esm.sh/isomorphic-git@1.10.3";

export interface Data extends BaseData {
  title?: string;
  lastModified?: Date;
  lastModifiedCommit?: ReadCommitResult;
  createdCommit?: ReadCommitResult;
  type?: "post" | "collection" | "collection-page" | "tag";
  /** Only for tag page */
  tag?: string;
  /** Only for collection-page: parent collection url */
  collection?: string;
  /** Path of source file */
  readonly sourceFile: string;
  /** History */
  history?: ReadCommitResult[];
  repository: { url: string; branch: string };
}
