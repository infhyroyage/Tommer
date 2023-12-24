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

  describe("Validation", () => {
    it("Should return 400 if the type of request body is not object", async () => {
      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: { string: JSON.stringify(0) },
        }),
        new InvocationContext({})
      );
      expect(response.status).toBe(400);
    });

    it("Should return 400 if there is a invalid attribute of request body", async () => {
      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: { string: JSON.stringify({ dummy: "dummy" }) },
        }),
        new InvocationContext({})
      );
      expect(response.status).toBe(400);
    });

    it("Should return 400 if the type of each makers is not string", async () => {
      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: { string: JSON.stringify({ makers: [0], prev: [] }) },
        }),
        new InvocationContext({})
      );
      expect(response.status).toBe(400);
    });

    it("Should return 400 if the type of previous ucs is not object", async () => {
      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: { string: JSON.stringify({ makers: [], prev: [0] }) },
        }),
        new InvocationContext({})
      );
      expect(response.status).toBe(400);
    });

    it("Should return 400 if there is a invalid attribute of previous ucs", async () => {
      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: {
            string: JSON.stringify({ makers: [], prev: [{ dummy: "dummy" }] }),
          },
        }),
        new InvocationContext({})
      );
      expect(response.status).toBe(400);
    });

    it("Should return 400 if the type of previous ucs maker is not string", async () => {
      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: {
            string: JSON.stringify({
              makers: [],
              prev: [{ maker: 0, no: 1, name: "name", upload: "upload" }],
            }),
          },
        }),
        new InvocationContext({})
      );
      expect(response.status).toBe(400);
    });

    it("Should return 400 if the type of previous ucs no is not number", async () => {
      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: {
            string: JSON.stringify({
              makers: [],
              prev: [
                { maker: "maker", no: "no", name: "name", upload: "upload" },
              ],
            }),
          },
        }),
        new InvocationContext({})
      );
      expect(response.status).toBe(400);
    });

    it("Should return 400 if the type of previous ucs name is not string", async () => {
      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: {
            string: JSON.stringify({
              makers: [],
              prev: [{ maker: "maker", no: 1, name: 0, upload: "upload" }],
            }),
          },
        }),
        new InvocationContext({})
      );
      expect(response.status).toBe(400);
    });

    it("Should return 400 if the type of previous ucs upload is not string", async () => {
      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: {
            string: JSON.stringify({
              makers: [],
              prev: [{ maker: "maker", no: 1, name: "name", upload: 0 }],
            }),
          },
        }),
        new InvocationContext({})
      );
      expect(response.status).toBe(400);
    });
  });
});
