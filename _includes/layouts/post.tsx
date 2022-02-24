/** @jsxImportSource nano */

import * as Nano from "nano";
import { BreadcrumbList, Items } from "components/breadcrumb-list.tsx";
import {
  Created,
  History,
  Modified,
  PullRequest,
  Source,
} from "components/badge.tsx";
import { Comments } from "components/comments.tsx";
import { Data } from "meta";
import site from "site";

export const layout = "layouts/base.tsx";

const template: Nano.FC<Data & { children: Nano.Component[] }> = (
  { children, ...data },
) => {
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

      <main itemscope itemtype="https://schema.org/Blog">
        <article
          itemprop="blogPost"
          itemscope
          itemtype="https://schema.org/BlogPosting"
        >
          <header class="mb-5">
            <h1 itemprop="headline" class="heading">{data.title}</h1>
            <section name="page-metadata" class="flex flex-col gap-3">
              <div name="breadcrumb-list" class="inline-flex flex-col gap-1">
                <div>
                  <BreadcrumbList
                    items={[...Items.fromTags(data.tags), {
                      name: data.title as string,
                      url: data.url as string,
                    }]}
                  />
                </div>
                {data.type === "collection-page"
                  ? (
                    <div>
                      <BreadcrumbList
                        items={[{
                          name: site.source
                            .getFileOrDirectory(data.collection!)!
                            .data.title as string,
                          url: data.collection!,
                        }, {
                          name: data.title as string,
                          url: data.url as string,
                        }]}
                      />
                    </div>
                  )
                  : undefined}
              </div>
              <div name="badges" class="inline-flex gap-2">
                <div name="created">
                  <Created>{data.date as Date}</Created>
                </div>

                {data.lastModified && (
                  <div name="lastModified">
                    <Modified>{data.lastModified}</Modified>
                  </div>
                )}

                <div name="source">
                  <Source data={data} />
                </div>

                <div name="history">
                  <History data={data} />
                </div>

                <div name="pull-request">
                  <PullRequest data={data} />
                </div>
              </div>
            </section>
          </header>

          <div class="post-content markdown-body mb-5">
            {children}
          </div>

          <hr />
        </article>
        <Comments data={data} />
      </main>
    </>
  );
};

export default template;
