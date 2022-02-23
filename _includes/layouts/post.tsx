/** @jsxImportSource nano */

import * as Nano from "nano";
import site, { repository } from "site";
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
  {
    children,
    tags,
    title,
    url,
    date,
    lastModified,
    lastModifiedCommit,
    createdCommit,
    sourceFile,
  },
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
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css"
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
            <h1 itemprop="headline" class="heading">{title}</h1>
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

          <div class="post-content markdown-body mb-5">
            {children}
          </div>

          <hr />
        </article>

        <section class="comments">
          <div name="horizon" class="border-t-2 border-double relative">
            <h1 class="absolute mx-auto text-lg text-center inset-x-0 -top-4">
              <span class="bg-gray-200 px-3 [clip-path:polygon(0_50%,10px_0,calc(100%-10px)_0,100%_50%,calc(100%-10px)_100%,10px_100%)]">
                <i class="fas fa-comments mx-2" />
              </span>
            </h1>
          </div>

          <div id="comments">
            <Comments
              items={[{
                created_at: new Date().toDateString(),
                user: { login: "Octcat" },
                body_html: "Loading...",
              }]}
            />
          </div>

          <div class="TimelineItem">
            <div class="TimelineItem-badge !bg-background">
              <a
                href={`${repository.url}/commit/${
                  lastModifiedCommit?.oid ?? createdCommit?.oid
                }#new_commit_comment_field`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  width="16"
                  height="16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81l-6.286 6.287a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.249.249 0 00.108-.064l6.286-6.286z"
                  >
                  </path>
                </svg>
              </a>
            </div>

            <div class="TimelineItem-body">
              <a
                href={`${repository.url}/commit/${
                  lastModifiedCommit?.oid ?? createdCommit?.oid
                }#new_commit_comment_field`}
              >
                コメントを追加
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default template;
