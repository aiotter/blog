import { Page } from "lume/core.ts";
import { Data } from "meta";

const dateCompare = (...pages: [Page, Page]) => {
  const pagesLastModified = pages.map((page) => page.data as Data)
    .map((data) => data.lastModified ?? data.date ?? new Date(0))
    .map((date) => date.getTime())

  return pagesLastModified[0] - pagesLastModified[1];
}

export const pages = {
  dateAscending: dateCompare,
  dateDescending: (...pages: [Page, Page]) => -dateCompare(...pages),
};
