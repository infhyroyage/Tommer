import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { Ucs } from "./types";
import { Browser, BrowserContext, Page, chromium } from "playwright-chromium";

export async function putUcsRecent(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const body: any = await request.json();
  context.info({ body });

  // Validation
  if (body === null || typeof body !== "object") {
    return { status: 400 };
  }
  for (const key in body) {
    if (
      typeof body[key] !== "object" ||
      typeof body[key].no !== "number" ||
      typeof body[key].name !== "string" ||
      typeof body[key].upload !== "string"
    ) {
      return { status: 400 };
    }
  }

  // const req: PutUcsRecent = { ...body };
  const browser: Browser = await chromium.launch({ headless: true });
  try {
    const browserContext: BrowserContext = await browser.newContext();
    const page: Page = await browserContext.newPage();
    await page.goto(
      "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=KE1DY"
    );

    const tbody = await page.$("tbody");
    if (tbody === null) return { jsonBody: {} };

    const recentTr = await tbody.$("tr");
    if (recentTr === null) return { jsonBody: {} };

    const recentTdNo = await recentTr.$("td.w_no.ucsShare");
    const recentPName = await recentTr.$("p.t1");
    const recentTdUpload = await recentTr.$("td.w_upload");
    if (recentTdNo === null || recentPName === null || recentTdUpload === null)
      return { jsonBody: {} };

    const no: number = Number(await recentTdNo.innerText());
    const name: string = await recentPName.innerText();
    const upload: string = await recentTdUpload.innerText();
    const recentUcs: Ucs = { no, name, upload };

    return { jsonBody: { KE1DY: recentUcs } };
  } finally {
    context.info("CLOSE");
    await browser.close();
  }
}
