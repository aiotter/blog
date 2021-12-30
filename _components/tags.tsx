/** @jsxImportSource nano */

import site from "site";

export const Tags = ({ children: tags }: { children?: string[] }) => (
  tags && site.pages
    .filter((page) => page.data.tag && tags.includes(page.data.tag as string))
    .sort((a, b) => (a.data.tag as string).localeCompare(b.data.tag as string))
    .map((page) => <a href={page.data.url}>{page.data.tag}</a>)
);
