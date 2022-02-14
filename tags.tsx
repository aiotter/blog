/** @jsx Nano.h */
/** @jsxFrag Nano.Fragment */

import * as Nano from "https://deno.land/x/nano_jsx@v0.0.26/mod.ts";
import { BreadcrumbList } from "components/breadcrumb-list.tsx";
import site from "site";
import { relative } from "std/path/mod.ts";
import { Data, Page } from "lume/core.ts";

export const layout = "layouts/base.tsx";
export const title = "Tags";

function getSortedTags(pages: Page[]) {
  const tagSet = new Set(pages.map((page) => page.data.tags).flat());
  return Array.from(tagSet).sort((a, b) => a!.localeCompare(b!));
}

export default (data: Data) => (
  <>
    <h1>Tags</h1>
    <BreadcrumbList
      items={[{
        name: "tags",
        url: site.url(relative(site.src(), new URL(import.meta.url).pathname)),
      }]}
    />
    <main>
      <ul>
        {site.pages.filter((page) => page.data.tag).sort((a, b) =>
          (a.data.tag as string).localeCompare(b.data.tag as string)
        )
          .map((page) => (
            <li class="list-disc list-inside">
              <a href={page.data.url}>{page.data.tag}</a>
            </li>
          ))}
      </ul>
    </main>
  </>
);
