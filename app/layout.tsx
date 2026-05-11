import "./globals.css";
import { Toaster } from "react-hot-toast";
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="vi-VN">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.4.0/fonts/remixicon.css" />
        <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-brands/css/uicons-brands.css" />
        <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-bold-rounded/css/uicons-bold-rounded.css" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var attrs = ['bis_skin_checked', 'bis_register'];
                  var els = document.querySelectorAll('[bis_skin_checked], [bis_register]');
                  for (var i = 0; i < els.length; i++) {
                    for (var j = 0; j < attrs.length; j++) {
                      els[i].removeAttribute(attrs[j]);
                    }
                  }
                  document.body.removeAttribute('bis_register');
                  var processed = document.querySelectorAll('[__processed_afc4b63a-bdac-4f7c-9d95-531fd40b2a9b__]');
                  for (var k = 0; k < processed.length; k++) {
                    processed[k].removeAttribute('__processed_afc4b63a-bdac-4f7c-9d95-531fd40b2a9b__');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1856de",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
};
export default RootLayout;
