import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

export async function detectRecentUcs(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const body: string = await request.text();
  context.log({ body });

  return { body: "OK" };
}

app.http("recent", {
  methods: ["PUT"],
  authLevel: "admin",
  handler: detectRecentUcs,
});
