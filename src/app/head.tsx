import Script from "next/script";

export default function Head() {
  return (
    <>
      {/* Google AdSense */}
      <meta
        name="google-adsense-account"
        content="ca-pub-8853112000993716"
      />
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8853112000993716"
        crossOrigin="anonymous"
      />

      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-P051RF09TL"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P051RF09TL');
          `,
        }}
      />
    </>
  );
}
