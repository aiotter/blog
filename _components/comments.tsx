/** @jsxImportSource nano */

import { Helmet } from "nano";
import { FormattedDate } from "components/date.tsx";
import { Horizon } from "components/horizon.tsx";
import { Data } from "meta";
import { Endpoints } from "https://esm.sh/@octokit/types@6.34.0";
type CommitComment =
  Endpoints["GET /repos/{owner}/{repo}/comments/{comment_id}"]["response"][
    "data"
  ];

type Comment = Partial<CommitComment> & { body_html?: string };

export const CommentsContent = (
  { items: comments }: { items: Comment[] },
) => (
  <>
    <Helmet>
      <link href="/primitives.css" rel="stylesheet" />
      <link
        href="https://unpkg.com/@primer/css@19.3.0/dist/timeline.css"
        rel="stylesheet"
      />
      <link
        href="https://unpkg.com/@primer/css@19.3.0/dist/markdown.css"
        rel="stylesheet"
      />
    </Helmet>
    {comments.map((comment) => (
      <div class="TimelineItem comment">
        <div class="TimelineItem-avatar">
          <a href={comment.user?.html_url}>
            <img
              class="rounded-full"
              height="40"
              width="40"
              alt={"@" + comment.user?.login}
              src={comment.user?.avatar_url ??
                "https://user-images.githubusercontent.com/334891/29999089-2837c968-9009-11e7-92c1-6a7540a594d5.png"}
            />
          </a>
        </div>

        <div class="TimelineItem-body border rounded-lg relative">
          <div
            name="comment-header"
            class="flex gap-x-2 rounded-t-lg px-4 py-2 before:hidden md:before:block before:absolute before:block before:top-[11px] before:right-full before:left-[-8px] before:w-[8px] before:h-[16px] before:content-['_'] before:[clip-path:polygon(0_50%,100%_0,100%_100%)] before:bg-teal-100 bg-teal-100"
          >
            <h3 class="font-sans">
              <a
                href={comment.user?.html_url}
                class="md:hidden inline-block mr-2"
              >
                <img
                  class="h-7 rounded-full inline-block"
                  alt={"@" + comment.user?.login}
                  src={comment.user?.avatar_url ??
                    "https://user-images.githubusercontent.com/334891/29999089-2837c968-9009-11e7-92c1-6a7540a594d5.png"}
                />
              </a>
              <a href={comment.user?.html_url} class="link font-bold">
                {comment.user!.login}
              </a>
              {" commented "}
              <a href={comment.html_url}>
                <FormattedDate
                  datetime={new Date(Date.parse(comment.created_at!))}
                  relative
                />
              </a>
            </h3>
          </div>
          <div
            name="comment-body"
            class="markdown-body bg-background rounded-b-lg px-4 py-2"
            dangerouslySetInnerHTML={{
              __html: comment.body_html ?? comment.body,
            }}
          />
        </div>
      </div>
    ))}
  </>
);

export const Comments = ({ data }: { data: Data }) => (
  <section class="comments">
    <Horizon>
      <i class="fas fa-comments mx-2" />
    </Horizon>

    <div id="comments">
      <CommentsContent
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
          href={`${data.repository.url}/commit/${
            data.lastModifiedCommit?.oid ?? data.createdCommit?.oid
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
          href={`${data.repository.url}/commit/${
            data.lastModifiedCommit?.oid ?? data.createdCommit?.oid
          }#new_commit_comment_field`}
        >
          コメントを追加
        </a>
      </div>
    </div>
  </section>
);
