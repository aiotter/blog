/** @jsxImportSource nano */

import * as Nano from "nano";
import site from "site";
import { BreadcrumbList, Items } from "components/breadcrumb-list.tsx";
import {
  Created,
  History,
  Modified,
  PullRequest,
  Source,
} from "components/badge.tsx";
import { PageList } from "components/page-list.tsx";
import { Comments } from "components/comments.tsx";
import { Horizon } from "components/horizon.tsx";
import { Data, sort } from "meta";
import { Page } from "lume/core.ts";

export const layout = "layouts/base.tsx";

const template: Nano.FC<Data & { children: Nano.Component[] }> = (
  { children, ...data },
) => {
  const collectionId = site.url(data.url as string, true);
  const thisPage = site.source.getFileOrDirectory(data.sourceFile) as Page;
  const collectionPages = Array.from(thisPage.parent!.pages.values())
    .filter((page) => page.data.url !== data.url)
    .sort(sort.pages.dateDescending);

  return (
    <>
      <Nano.Helmet>
        <link href="/primitives.css" rel="stylesheet" />
        <link
          href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.4.0/build/styles/github.min.css"
          rel="stylesheet"
        />
        <link
          href="https://unpkg.com/@primer/css@19.3.0/dist/markdown.css"
          rel="stylesheet"
        />
        <script src="/scripts/comment.js" />
      </Nano.Helmet>

      <main
        itemscope
        itemtype="https://schema.org/Collection"
        itemid={collectionId}
      >
        <header name="collection-metadata" class="mb-5">
          <h1
            itemprop="name"
            class="heading before:content-['\f07c'] before:font-awesome before:font-normal before:text-gray-700 before:mr-2"
          >
            {data.title}
          </h1>

          <section name="breadcrumb-list">
            <BreadcrumbList
              items={Items.fromTags(data.tags).concat({
                name: data.title as string,
                url: data.url as string,
              })}
            />
          </section>
        </header>

        <section name="collection-body" class="mb-16">
          <div class="markdown-body mb-5">{children}</div>

          <Horizon class="my-10">
            <i class="fa-solid fa-book-open" />
          </Horizon>

          <div class="max-w-xl mx-auto">
            <PageList items={collectionPages} date />
          </div>
        </section>

        <Comments data={data} />
      </main>
    </>
  );
};

export default template;
