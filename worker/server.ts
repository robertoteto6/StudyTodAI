import { createServer } from "node:http";
import { processDocumentJob } from "@/lib/server/processing";

const port = Number(process.env.PORT ?? 8080);

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/process-document") {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
  });

  request.on("end", async () => {
    try {
      const payload = JSON.parse(body) as { documentId: string; jobId: string };
      await processDocumentJob(payload);
      response.writeHead(202, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ accepted: true }));
    } catch (error) {
      response.writeHead(500, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Worker failure",
        }),
      );
    }
  });
});

server.listen(port, () => {
  console.log(`StudyTodAI worker listening on http://localhost:${port}`);
});
