/** @jsx Nano.h */
/** @jsxFrag Nano.Fragment */

import * as Nano from "nano";
import site from "site";
import { Data, url } from "meta";
import { Page } from "lume/core.ts";
import { BreadcrumbList } from "components/breadcrumb-list.tsx";

export const layout = "layouts/base.tsx";

export default function* (): Generator<Data> {
  const tags = new Set(
    site.pages.map((page) => page.data.tags).filter(Boolean).flat(),
  );
  for (const tag of tags) {
    if (!tag) continue;

    const title = `#${tag}`;

    yield {
      url: url.tag(tag),
      title,
      tag,
      layout: "layouts/base.tsx",
      type: "tag",
      content: () => (
        <>
          <h1>{title}</h1>
          <ol>
            <BreadcrumbList
              items={[{
                name: "tags",
                url: site.url(new URL("./tags.tsx", import.meta.url).href),
              }, { name: title, url: url.tag(tag) }]}
            />
            {() =>
              site.pages.filter((page) => page.data.tags?.includes(tag)).map(
                (page) => (
                  <li>
                    <a href={site.url(page.data.url as string)}>
                      {page.data.title}
                    </a>
                  </li>
                ),
              )}
            <li></li>
          </ol>
        </>
      ),
    };
  }
}
