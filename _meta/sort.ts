import { Page } from "lume/core.ts";

const getLastModified = (page: Page) =>
  page.data.lastModified as Date | undefined || page.data.date;

const dateCompare = (...pages: [Page, Page]) =>
  pages.map(getLastModified)
    .map((date) => date?.valueOf())
    .reduce((...dateValues) => dateValues[0]! - dateValues[1]!) ?? 0;

export const pages = {
  dateAscending: dateCompare,
  dateDescending: (...pages: [Page, Page]) =>
    dateCompare(...pages.reverse() as [Page, Page]),
};
