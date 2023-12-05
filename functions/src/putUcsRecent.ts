import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { PutUcsRecent } from "./types";

export async function putUcsRecent(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const body: any = await request.json();
  context.info({ body });

  if (body === null || typeof body !== "object") {
    return { status: 400, body: "Bad Request" };
  }
  for (const key in body) {
    if (
      typeof body[key] !== "object" ||
      typeof body[key].no !== "number" ||
      typeof body[key].name !== "string" ||
      typeof body[key].upload !== "string"
    ) {
      return { status: 400, body: "Bad Request" };
    }
  }

  const req: PutUcsRecent = { ...body };

  return { jsonBody: req };
}
