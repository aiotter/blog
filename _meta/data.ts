import {Data as BaseData} from "lume/core.ts";

export interface Data extends BaseData {
  lastModified?: Date;
  type?: "post" | "tag";
  /** Only for tag page */
  tag?: string;
}
