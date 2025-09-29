const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Fungsi untuk generate file HTML 
function generateHTML(filename, targetBytes) {
  const head = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename.replace(".html", "")}</title>
    <style>
        p {
            word-wrap: break-word;
            overflow-wrap: break-word;
            word-break: break-all;
            max-width: 100%;
        }
    </style>
</head>
<body>
    <h1>HTML ${filename.replace(".html", "").toUpperCase()}</h1>
    <p>`;

  const tail = `
    </p>
</body>
</html>`;

  const headBytes = Buffer.byteLength(head, "utf8");
  const tailBytes = Buffer.byteLength(tail, "utf8");
  const contentBytes = Math.max(0, targetBytes - headBytes - tailBytes);

  const content = "A".repeat(contentBytes);
  const finalHTML = head + content + tail;

  const filePath = path.join(publicDir, filename);
  fs.writeFileSync(filePath, finalHTML, "utf8");

  return fs.existsSync(filePath);
}

const fileSizes = {
  "10kb.html": 10 * 1024,
  "100kb.html": 100 * 1024,
  "1mb.html": 1 * 1024 * 1024,
  "5mb.html": 5 * 1024 * 1024,
  "10mb.html": 10 * 1024 * 1024,
};

let allSuccess = true;
for (const [filename, size] of Object.entries(fileSizes)) {
  const success = generateHTML(filename, size);
  if (!success) allSuccess = false;
}

if (allSuccess) {
  console.log("Success generate all files");
} else {
  console.log("Failed to generate some files");
}
