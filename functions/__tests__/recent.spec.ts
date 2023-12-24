import {
  HttpRequest,
  HttpRequestInit,
  InvocationContext,
} from "@azure/functions";
import { recent } from "../src/recent";

// jest.mock("playwright-chromium");

const httpRequestInitDefault: HttpRequestInit = {
  url: "http://localhost:7071/api/recent",
  method: "put",
};

describe("[PUT] /recent", () => {
  // let mockBrowser: jest.Mocked<Browser>;
  // let mockPage: jest.Mocked<Page>;

  // beforeEach(() => {
  //   // Mock Browser and Page
  //   mockBrowser = {
  //     newContext: jest.fn().mockResolvedValue({
  //       newPage: jest.fn(),
  //     }),
  //     close: jest.fn(),
  //   } as unknown as jest.Mocked<Browser>;
  //   mockPage = {
  //     goto: jest.fn(),
  //     $: jest.fn(),
  //   } as unknown as jest.Mocked<Page>;
  //   // Mock chromium.launch to return the mockBrowser
  //   (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);
  //   // Mock browser.newContext().newPage() to return the mockPage
  //   mockBrowser.newContext.mockResolvedValue({
  //     newPage: jest.fn().mockResolvedValue(mockPage),
  //   });
  // });

  it("Should return 400 if the type of request body is number", async () => {
    const requestBody: number = 0;
    const response = await recent(
      new HttpRequest({
        ...httpRequestInitDefault,
        body: { string: JSON.stringify(requestBody) },
      }),
      new InvocationContext({})
    );

    expect(response.status).toBe(400);
  });
});
