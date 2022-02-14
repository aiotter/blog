/** @jsx Nano.h */
/** @jsxFrag Nano.Fragment */

import * as Nano from "nano";
import site from "site";
import { relative } from "std/path/mod.ts";
import { Data, sort, url } from "meta";
import { BreadcrumbList } from "components/breadcrumb-list.tsx";

export default function* (): Generator<Data> {
  const tags = new Set(
    site.pages.map((page) => page.data.tags).flat().filter(Boolean)
      .map((tag) => tag!.toLowerCase()),
  );
  for (const tag of tags) {
    const title = `#${tag}`;
    const sourceFile = relative(site.src(), new URL(import.meta.url).pathname);

    yield {
      url: url.tag(tag),
      title,
      tag,
      layout: "layouts/base.tsx",
      type: "tag",
      sourceFile,
      content: () => (
        <>
          <h1>{title}</h1>
          <BreadcrumbList
            items={[{
              name: "tags",
              url: site.url(
                relative(
                  site.src(),
                  new URL("./tags.tsx", import.meta.url).pathname,
                ),
              ),
            }, { name: title, url: url.tag(tag) }]}
          />
          <main class="my-5">
            <ol>
              {site.pages
                .filter((page) => page.data.tags?.includes(tag))
                .sort(sort.pages.dateDescending)
                .map(
                  (page) => (
                    <li class="list-disc">
                      <a href={site.url(page.data.url as string)}>
                        {page.data.title}
                      </a>
                    </li>
                  ),
                )}
            </ol>
          </main>
        </>
      ),
    };
  }
}
