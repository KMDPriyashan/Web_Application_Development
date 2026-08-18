function Page(title, bodyHtml) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 0 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #7c4dff; color: white; }
        tr:nth-child(even) { background: #f9f9f9; }
        h1 { color: #333; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${bodyHtml}
    </body>
    </html>
  `;
}

module.exports = Page;