export default defineEventHandler(async (event) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Documentation - E-Learning MJK</title>
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
      <style>
        html {
          box-sizing: border-box;
          overflow: -moz-scrollbars-vertical;
          overflow-y: scroll;
        }
        *, *:before, *:after {
          box-sizing: inherit;
        }
        body {
          margin: 0;
          background: #fafafa;
        }
        .swagger-ui .topbar {
          background-color: #1f2937;
        }
        .swagger-ui .topbar .download-url-wrapper {
          display: none;
        }
        .swagger-ui .info {
          margin: 50px 0;
        }
        .swagger-ui .info .title {
          color: #1f2937;
        }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          const ui = SwaggerUIBundle({
            url: '/openapi.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout",
            validatorUrl: null,
            docExpansion: 'list',
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
            displayRequestDuration: true,
            tryItOutEnabled: true,
            requestInterceptor: function(request) {
              // Add Authorization header if token exists in localStorage or cookies
              const token = localStorage.getItem('token') ||
                           document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

              if (token && !request.headers.Authorization) {
                request.headers.Authorization = 'Bearer ' + token;
              }
              return request;
            },
            responseInterceptor: function(response) {
              // Handle response here if needed
              return response;
            }
          });

          // Add custom styling and features
          window.ui = ui;
        };
      </script>
    </body>
    </html>
  `;

  setHeader(event, 'Content-Type', 'text/html');
  return html;
});