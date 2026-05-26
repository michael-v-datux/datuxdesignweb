<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>datux.design — Sitemap</title>
        <style>
          body {
            font-family: system-ui, sans-serif;
            margin: 2rem;
            color: #333;
            line-height: 1.5;
          }
          h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
          p.meta { color: #666; margin-top: 0; margin-bottom: 1.5rem; }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95rem;
          }
          th, td {
            text-align: left;
            padding: 0.6rem 0.75rem;
            border-bottom: 1px solid #e5e5e5;
            vertical-align: top;
          }
          th { background: #f5f5f5; font-weight: 600; }
          a { color: #2563eb; word-break: break-all; }
          .alt { font-size: 0.85rem; color: #555; }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <p class="meta">
          This file is for search engines. URLs listed below are indexable pages on datux.design.
        </p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last modified</th>
              <th>Alternates</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="s:urlset/s:url">
              <tr>
                <td>
                  <a href="{s:loc}"><xsl:value-of select="s:loc" /></a>
                </td>
                <td><xsl:value-of select="s:lastmod" /></td>
                <td class="alt">
                  <xsl:for-each select="xhtml:link">
                    <div>
                      <xsl:value-of select="@hreflang" />:
                      <xsl:value-of select="@href" />
                    </div>
                  </xsl:for-each>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
