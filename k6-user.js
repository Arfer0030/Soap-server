import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const SOAP_ENDPOINT = "http://192.168.56.1:8080/htmlservice";

// Custom metrics
const errorRate = new Rate("errors");
const responseTime = new Trend("soap_response_time");

export let options = {
  scenarios: {
    idle_users_test: {
      executor: "ramping-vus",
      startVUs: 100,
      stages: [
        { duration: "20s", target: 1000 },
        { duration: "30s", target: 5000 },
        { duration: "40s", target: 7500 },
        { duration: "1m", target: 10000 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    soap_response_time: ["p(99) < 5000"],
    errors: ["rate < 0.10"],
  },
};

// SOAP XML untuk GetHtmlFile dengan size 10kb
const soapXML = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:tns="http://htmlservice.example.com/">
   <soap:Header/>
   <soap:Body>
      <tns:GetHtmlFileRequest>
         <tns:size>10kb</tns:size>
      </tns:GetHtmlFileRequest>
   </soap:Body>
</soap:Envelope>`;

// SOAP Headers
const headers = {
  "Content-Type": "text/xml; charset=utf-8",
  SOAPAction: "http://htmlservice.example.com/GetHtmlFile",
};

export default function () {
  let startTime = Date.now();

  try {
    // Send SOAP request
    const response = http.post(SOAP_ENDPOINT, soapXML, { headers });

    let duration = Date.now() - startTime;
    responseTime.add(duration);

    // Check response
    const success = check(response, {
      "status is 200": (r) => r.status === 200,
      "has content": (r) => r.body && r.body.includes("<content>"),
      "no soap fault": (r) => !r.body.includes("soap:Fault"),
      "response time < 5s": (r) => r.timings.duration < 5000,
    });

    errorRate.add(!success);
  } catch (error) {
    let duration = Date.now() - startTime;
    responseTime.add(duration);
    console.error(`Request failed: ${error.message}`);
    errorRate.add(1);
  }

  sleep(1);
}
