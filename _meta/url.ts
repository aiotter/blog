import site from "site";

export const tag = (tag: string) => site.url(`/tags/${tag}/index.html`);
