/** @jsxImportSource nano */

import { Component, FC } from "nano";

export const Horizon: FC<{ children: Component; class?: string }> = (
  { children, class: className },
) => (
  <div
    name="horizon"
    class={"border-t-2 border-gray-200 relative" +
      (className ? " " + className : "")}
  >
    <div class="absolute mx-auto text-lg text-center inset-x-0 -top-4">
      <div class="h-8 w-16 mx-auto bg-gray-200 [clip-path:polygon(0_50%,10px_0,calc(100%-10px)_0,100%_50%,calc(100%-10px)_100%,10px_100%)]">
        {children}
      </div>
    </div>
  </div>
);
