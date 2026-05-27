import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/** Web document shell — viewport + mobile-friendly defaults. */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root { height: 100%; background: #000; }
              body { margin: 0; overflow-x: hidden; -webkit-text-size-adjust: 100%; }
              * { box-sizing: border-box; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
