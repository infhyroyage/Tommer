import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { PutRecentReq, PutRecentRes, Ucs } from "./types";
import { Browser, Page, chromium } from "playwright-chromium";

export async function recent(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const req = (await request.json()) as PutRecentReq;
  context.info({ req });

  // Validation
  if (
    typeof req !== "object" ||
    Object.keys(req).some((key: string) => !["makers", "prev"].includes(key)) ||
    req.makers.some((maker: string) => typeof maker !== "string") ||
    req.prev.some(
      (ucs: Ucs) =>
        typeof ucs !== "object" ||
        Object.keys(ucs).some(
          (key: string) => !["maker", "no", "name", "upload"].includes(key)
        ) ||
        typeof ucs.maker !== "string" ||
        typeof ucs.no !== "number" ||
        typeof ucs.name !== "string" ||
        typeof ucs.upload !== "string"
    )
  ) {
    return { status: 400 };
  }

  // Filter Recent UCS List at Previous Execution
  const filteredPrev: Ucs[] = req.makers.map((maker: string) => {
    const foundUcs: Ucs | undefined = req.prev.find(
      (ucs: Ucs) => ucs.maker === maker
    );
    return foundUcs ? foundUcs : { maker, no: -1, name: "", upload: "" };
  });

  // Scrape Recent UCS and Update Response body per UCS Maker
  const recent: Ucs[] = [];
  const notification: Ucs[] = [];
  const browser: Browser = await chromium.launch({ headless: true });
  try {
    for (const ucs of filteredPrev) {
      // Scraping
      const maker: string = ucs.maker;
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
      recent.push({ maker, no, name, upload });
      if (ucs.no !== -1 && ucs.no !== no) {
        notification.push({ maker, no, name, upload });
      }
    }

    const res: PutRecentRes = { recent, notification };
    return { status: 200, jsonBody: res };
  } finally {
    await browser.close();
  }
}
