/** @jsxImportSource nano */

import { FC, Helmet } from "nano";

export const FormattedDate: FC<
  { datetime: Date; relative?: boolean; format?: string }
> = (
  { datetime, relative, format },
) => (
  <>
    <Helmet>
      <script src="https://unpkg.com/dayjs@1.8.21/dayjs.min.js" />
      <script src="https://unpkg.com/dayjs@1.8.21/plugin/relativeTime.js" />
      <script>
        dayjs.extend(window.dayjs_plugin_relativeTime);
        window.addEventListener('DOMContentLoaded', () =&gt;
          Array.from(document.getElementsByTagName("time"))
            .filter(element =&gt; element.attributes.relative)
            .forEach(element =&gt;
              element.innerHTML =
                dayjs(element.attributes.getNamedItem("datetime").value).fromNow()
            );
          Array.from(document.getElementsByTagName("time"))
            .filter(element =&gt; element.attributes.relative)
            .forEach(element =&gt;
              element.innerHTML =
                dayjs(element.attributes.getNamedItem("datetime").value)
                  .format(element.attributes.getNamedItem("format").value)
            );
        );
      </script>
    </Helmet>

    <time datetime={datetime.toISOString()} {...relative} {...format} >
      {datetime.toLocaleDateString()}
    </time>
  </>
);
