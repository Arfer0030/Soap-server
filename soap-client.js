// File buat ngetes doang SOAP client

const soap = require("soap");

// URL WSDL
const url = "http://localhost:8080/htmlservice?wsdl";

async function testSoapService() {
  try {
    // Buat SOAP client
    const client = await new Promise((resolve, reject) => {
      soap.createClient(url, (err, client) => {
        if (err) reject(err);
        else resolve(client);
      });
    });

    console.log("SOAP Client berhasil terhubung!");
    console.log("Available methods:", Object.keys(client));

    // Test GetApiInfo
    console.log("\n=== Testing GetApiInfo ===");
    const apiInfoResult = await new Promise((resolve, reject) => {
      client.GetApiInfo({}, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log("API Info Response:", JSON.stringify(apiInfoResult, null, 2));

    // Test GetHtmlFile
    console.log("\n=== Testing GetHtmlFile ===");
    const sizes = ["10kb", "100kb", "1mb"];

    for (const size of sizes) {
      try {
        const fileResult = await new Promise((resolve, reject) => {
          client.GetHtmlFile({ size }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        console.log(`\nfile name: ${fileResult.fileName}`);
        console.log(`- Content Type: ${fileResult.contentType}`);
        console.log(`- File Size: ${fileResult.fileSize} bytes`);
        console.log(
          `- Content Preview: ${fileResult.content.substring(0, 100)}...`
        );
      } catch (error) {
        console.error(`Error getting ${size} file:`, error.message);
      }
    }
  } catch (error) {
    console.error("Client error:", error);
  }
}

// Run test
if (require.main === module) {
  testSoapService();
}

module.exports = { testSoapService };
