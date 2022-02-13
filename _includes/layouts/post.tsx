/** @jsxImportSource nano */

import * as Nano from "nano";
import site from "site";
import { BreadcrumbList } from "components/breadcrumb-list.tsx";
import {
  Created,
  History,
  Modified,
  PullRequest,
  Source,
} from "components/badge.tsx";
import { Comments } from "components/comments.tsx";
import { Data } from "meta";

export const layout = "layouts/base.tsx";

const template: Nano.FC<Data & { children: Nano.Component[] }> = (
  { children, tags, title, url, date, lastModified, sourceFile },
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
      </Nano.Helmet>

      <main itemscope itemtype="https://schema.org/Blog">
        <article
          itemprop="blogPost"
          itemscope
          itemtype="https://schema.org/BlogPosting"
        >
          <header class="mb-5">
            <h1 itemprop="headline">{title}</h1>
            <section name="page-metadata" class="flex flex-col gap-3">
              <div name="breadcrumb-lists">
                {tags && (
                  <BreadcrumbList
                    items={[
                      { name: "tags", url: "/tags.tsx" },
                      tags.map((tag) => ({
                        name: tag,
                        url: site.pages.find((page) => page.data.tag === tag)
                          ?.data.url as string,
                      })),
                      {
                        name: title as string,
                        url: url as string,
                      },
                    ]}
                  />
                )}
              </div>
              <div name="badges" class="inline-flex gap-2">
                <div name="created">
                  <Created>{date as Date}</Created>
                </div>

                {lastModified && (
                  <div name="lastModified">
                    <Modified>{lastModified}</Modified>
                  </div>
                )}

                <div name="source">
                  <Source path={sourceFile} />
                </div>

                <div name="history">
                  <History path={sourceFile} />
                </div>

                <div name="pull-request">
                  <PullRequest path={sourceFile} />
                </div>
              </div>
            </section>
          </header>

          <div class="markdown-body mb-5">
            {children}
          </div>

          <hr />

          <div id="comments">
            <Comments />
          </div>
        </article>
      </main>
    </>
  );
};

export default template;
