/** @jsxImportSource nano */
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="dom.iterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import * as Nano from "nano";
import site from "site";
import { Data } from "meta";

function image(data: Data) {
  const url = new URL(
    "/ogp/image" + data.url + "index.png",
    site.url("", true),
  );
  return url.href;
}

const template: Nano.FC<{ children: Nano.Component } & Data> = (
  { children, ...data },
) => {
  const App: Nano.FC = () => (
    <>
      <Nano.Helmet>
        {() => {
          if (data.title) return <title>{data.title}</title>;
        }}
        <link href="/style.css" rel="stylesheet" type="text/css" />
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
        <meta property="og:image" content={image(data)} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={site.url(data.url as string, true)} />
        <meta name="twitter:title" content={data.title} />
        <meta name="twitter:image" content={image(data)} />
        <meta name="twitter:creator" content="aiotter_tech" />

        <script dangerouslySetInnerHTML={{__html: `(function(d) {
            var config = {
              kitId: 'qkx3nsf',
              scriptTimeout: 3000,
              async: true
            },
            h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
          })(document);`}} />
      </Nano.Helmet>

      <body>
        {children}
      </body>
    </>
  );

  const html = Nano.renderSSR(<App />);
  const { body, head, attributes } = Nano.Helmet.SSR(html);
  const Head: Nano.FC = () =>
    head.length > 0
      ? <head innerHTML={{ __dangerousHtml: head.join("") }} />
      : <head />;

  return (
    <html {...Object.fromEntries(attributes.html)}>
      <Head />
      <body
        {...Object.fromEntries(attributes.body)}
        innerHTML={{ __dangerousHtml: body }}
      />
    </html>
  );
};
export default template;
