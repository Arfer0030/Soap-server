const soap = require('soap');
const express = require('express');
const fs = require('fs');
const path = require('path');
const fsp = require('fs').promises;

// define implementasi service
const htmlServiceImpl = {
    HtmlService: {
        HtmlServicePort: {
            // service buat dapetin api info
            GetApiInfo: function(args, callback) {
                try {
                    const response = {
                        message: "Soap API Html File Server",
                        endpoint: {
                            item: [                                
                                "GetHtmlFile - SOAP Api untuk file HTML",
                                "Available sizes: 10kb, 100kb, 1mb, 5mb, 10md"
                            ]
                        }
                    };
                    callback(null, response);
                } catch (error) {
                    callback({
                        faultcode: "server",
                        faultstring: error.message
                    });
                }
            },
            // service buat dapetin file html
            GetHtmlFile: async function(args, callback) {
                try {
                    const size = args.size || '10kb';
                    const validSizes = ['10kb', '100kb', '1mb', '5mb', '10mb'];

                    if (!validSizes.includes(size)) {
                        return callback({
                            faultcode: "client",
                            faultstring: "Invalid size parameter. Valid sizes are: " + validSizes.join(', ')
                        });
                    }

                    const filePath = path.join(__dirname, 'public', `${size}.html`);

                    try {
                        const stats = await fsp.stat(filePath);

                        const content = await fsp.readFile(filePath, 'utf8');

                        const response = {
                            fileName: `${size}.html`,
                            fileSize: stats.size,
                            content: content,
                            contentType: "text/html; charset=utf-8"
                        };

                        callback(null, response);
                    } catch (fileErr) {
                        console.error("File read error:", fileErr);

                        if (fileErr.code === 'ENOENT') {
                            return callback({
                                faultcode: "client",
                                faultstring: "Requested file not found."
                            });
                        }else {
                            return callback({
                                faultcode: "server",
                                faultstring: "internal server error."
                            });
                        }
                    }
                } catch (error) {
                    console.error("Unexpected error:", error);
                    callback({
                        faultcode: "server",
                        faultstring: "internal server error."
                    });
                }
            }
        }
    }
};

function main() {
    const app = express();
    
    app.get('/', function (req, res) {
    res.send(`
      <h2>SOAP HTML File Server</h2>
      <p>WSDL tersedia di: <a href="http://localhost:8080/htmlservice?wsdl">http://localhost:8080/htmlservice?wsdl</a></p>
      <p>Available operations:</p>
      <ul>
        <li>GetApiInfo(): Mendapatkan informasi API</li>
        <li>GetHtmlFile(size): Mendapatkan file HTML</li>
      </ul>
      <p>Available sizes: 10kb, 100kb, 1mb, 5mb, 10mb</p>
    `);
  });

  const PORT = process.env.SOAP_PORT || 8080;

  // Load WSDL file
  const wsdlPath = path.join(__dirname, "html-service.wsdl");
  const xml = fs.readFileSync(wsdlPath, "utf8");
   // Start HTTP server
  app.listen(PORT, function () {
    console.log(`HTTP Server berjalan di http://localhost:${PORT}`);
    console.log(`WSDL tersedia di: http://localhost:${PORT}/htmlservice?wsdl`);
    
    // Buat SOAP server
    soap.listen(app, '/htmlservice', htmlServiceImpl, xml);
    
    console.log("SOAP Services:");
    console.log("- GetApiInfo(): Mendapatkan informasi API");
    console.log("- GetHtmlFile(size): Mendapatkan file HTML");
    console.log("- Available sizes: 10kb, 100kb, 1mb, 5mb, 10mb");
  });
}

// Error handling
process.on("SIGINT", () => {
  console.log("\nShutting down SOAP server...");
  process.exit(0);
});

// Run server
if (require.main === module) {
  main();
}
