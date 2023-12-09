import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { PutUcsRecentReq, PutUcsRecentRes, Ucs } from "./types";
import { Browser, Page, chromium } from "playwright-chromium";

export async function putUcsRecent(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const req: PutUcsRecentReq = (await request.json()) as PutUcsRecentReq;
  context.info({ req });

  // Validation
  if (req === null || typeof req !== "object") {
    return { status: 400 };
  }
  for (const maker in req) {
    if (typeof req[maker] !== "number") {
      return { status: 400 };
    }
  }

  // Scrape Recent UCS and Update Response body per UCS Maker
  const next: PutUcsRecentReq = {};
  const notification: { [maker: string]: Ucs } = {};
  const browser: Browser = await chromium.launch({ headless: true });
  try {
    for (const maker of Object.keys(req)) {
      // Scraping
      const page: Page = await (await browser.newContext()).newPage();
      await page.goto(
        `https://ucs.piugame.com/ucs_share?s_type=maker&s_val=${maker}`
      );
      const tbody = await page.$("tbody");
      if (tbody === null) {
        context.warn(`[maker: ${maker}] tbody is null.`);
        continue;
      }
      const recentTr = await tbody.$("tr");
      if (recentTr === null) {
        context.warn(`[maker: ${maker}] tr is null.`);
        continue;
      }
      const recentTdNo = await recentTr.$("td.w_no.ucsShare");
      if (recentTdNo === null) {
        context.warn(`[maker: ${maker}] td.w_no.ucsShare is null.`);
        continue;
      }
      const recentPName = await recentTr.$("p.t1");
      if (recentPName === null) {
        context.warn(`[maker: ${maker}] p.t1 is null.`);
        continue;
      }
      const recentTdUpload = await recentTr.$("td.w_upload");
      if (recentTdUpload === null) {
        context.warn(`[maker: ${maker}] td.w_upload is null.`);
        continue;
      }
      const no: number = Number(await recentTdNo.innerText());
      if (Number.isNaN(no)) {
        context.warn(`[maker: ${maker}] Variable "no" is NaN.`);
        continue;
      }
      const name: string = await recentPName.innerText();
      if (name === "") {
        context.warn(`[maker: ${maker}] Variable "name" is empty.`);
        continue;
      }
      const upload: string = await recentTdUpload.innerText();
      if (upload === "") {
        context.warn(`[maker: ${maker}] Variable "upload" is empty.`);
        continue;
      }

      // Updating
      next[maker] = no;
      if (req[maker] !== no) {
        notification[maker] = { no, name, upload };
      }
    }

    const res: PutUcsRecentRes = { next, notification };
    return { status: 200, jsonBody: res };
  } finally {
    await browser.close();
  }
}
