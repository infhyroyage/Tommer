import {
  HttpRequest,
  HttpRequestInit,
  InvocationContext,
} from "@azure/functions";
import { recent } from "../src/recent";
import { Browser, Page, chromium } from "playwright-chromium";

const httpRequestInitDefault: HttpRequestInit = {
  url: "http://localhost:7071/api/recent",
  method: "put",
};

jest.mock("playwright-chromium");

describe("[PUT] /recent", () => {
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

  describe("Scraping if previous ucs is empty", () => {
    const mock$Page = jest.fn();
    const mock$Tbody = jest.fn();
    const mock$Tr = jest.fn();
    const mock$TdNo = jest.fn();
    const mock$PName = jest.fn();
    const mock$TdUpload = jest.fn();
    const mockClose = jest.fn();
    const mockGoto = jest.fn();
    const mockNewContext = jest.fn();
    const mockNewPage = jest.fn();
    const mockWarn = jest.fn();

    const invocationContext = {
      debug: jest.fn(),
      error: jest.fn(),
      extraInputs: {
        get: jest.fn(),
        set: jest.fn(),
      },
      extraOutputs: {
        get: jest.fn(),
        set: jest.fn(),
      },
      functionName: "functionName",
      info: jest.fn(),
      invocationId: "invocationId",
      log: jest.fn(),
      options: {
        trigger: { type: "type", name: "name" },
        extraInputs: [],
        extraOutputs: [],
      },
      trace: jest.fn(),
      warn: mockWarn,
    };

    beforeEach(() => {
      jest.resetAllMocks();

      // Mock playwright-chromium
      (chromium.launch as jest.Mock).mockResolvedValue({
        newContext: mockNewContext.mockResolvedValue({
          newPage: mockNewPage.mockResolvedValue({
            goto: mockGoto,
            $: mock$Page,
          } as unknown as jest.Mocked<Page>),
        }),
        close: mockClose,
      } as unknown as jest.Mocked<Browser>);
    });

    it("Should return empty recent ucs list and empty notifications if previous ucs and maker are empty", async () => {
      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: {
            string: JSON.stringify({
              makers: [],
              prev: [],
            }),
          },
        }),
        new InvocationContext({})
      );

      expect(response.status).toBe(200);
      expect(response.jsonBody).toStrictEqual({ recent: [], notification: [] });
      expect(mock$Page).toHaveBeenCalledTimes(0);
      expect(mock$Tbody).toHaveBeenCalledTimes(0);
      expect(mock$Tr).toHaveBeenCalledTimes(0);
      expect(mock$TdNo).toHaveBeenCalledTimes(0);
      expect(mock$PName).toHaveBeenCalledTimes(0);
      expect(mock$TdUpload).toHaveBeenCalledTimes(0);
      expect(mockClose).toHaveBeenCalled();
      expect(mockGoto).toHaveBeenCalledTimes(0);
      expect(mockNewContext).toHaveBeenCalledTimes(0);
      expect(mockNewPage).toHaveBeenCalledTimes(0);
      expect(mockWarn).toHaveBeenCalledTimes(0);
    });

    it("Should return empty recent ucs list and empty notifications if tbody is null", async () => {
      mock$Page.mockResolvedValueOnce(null);

      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: {
            string: JSON.stringify({
              makers: ["maker1"],
              prev: [],
            }),
          },
        }),
        invocationContext
      );

      expect(response.status).toBe(200);
      expect(response.jsonBody).toStrictEqual({ recent: [], notification: [] });
      expect(mock$Page).toHaveBeenCalledWith("tbody");
      expect(mock$Tbody).toHaveBeenCalledTimes(0);
      expect(mock$Tr).toHaveBeenCalledTimes(0);
      expect(mock$TdNo).toHaveBeenCalledTimes(0);
      expect(mock$PName).toHaveBeenCalledTimes(0);
      expect(mock$TdUpload).toHaveBeenCalledTimes(0);
      expect(mockClose).toHaveBeenCalled();
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalled();
      expect(mockNewPage).toHaveBeenCalled();
      expect(mockWarn).toHaveBeenCalledWith("[maker: maker1] tbody is null.");
    });

    it("Should return empty recent ucs list and empty notifications if tr is null", async () => {
      mock$Tbody.mockResolvedValueOnce(null);
      mock$Page.mockResolvedValueOnce({ $: mock$Tbody });

      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: {
            string: JSON.stringify({
              makers: ["maker1"],
              prev: [],
            }),
          },
        }),
        invocationContext
      );

      expect(response.status).toBe(200);
      expect(response.jsonBody).toStrictEqual({ recent: [], notification: [] });
      expect(mock$Page).toHaveBeenCalledWith("tbody");
      expect(mock$Tbody).toHaveBeenCalledWith("tr");
      expect(mock$Tr).toHaveBeenCalledTimes(0);
      expect(mock$TdNo).toHaveBeenCalledTimes(0);
      expect(mock$PName).toHaveBeenCalledTimes(0);
      expect(mock$TdUpload).toHaveBeenCalledTimes(0);
      expect(mockClose).toHaveBeenCalled();
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalled();
      expect(mockNewPage).toHaveBeenCalled();
      expect(mockWarn).toHaveBeenCalledWith("[maker: maker1] tr is null.");
    });

    it("Should return empty recent ucs list and empty notifications if td.w_no.ucsShare is null", async () => {
      mock$Tr.mockResolvedValueOnce(null);
      mock$Tbody.mockResolvedValueOnce({ $: mock$Tr });
      mock$Page.mockResolvedValueOnce({ $: mock$Tbody });

      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: {
            string: JSON.stringify({
              makers: ["maker1"],
              prev: [],
            }),
          },
        }),
        invocationContext
      );

      expect(response.status).toBe(200);
      expect(response.jsonBody).toStrictEqual({ recent: [], notification: [] });
      expect(mock$Page).toHaveBeenCalledWith("tbody");
      expect(mock$Tbody).toHaveBeenCalledWith("tr");
      expect(mock$Tr).toHaveBeenCalledTimes(1);
      expect(mock$Tr).toHaveBeenNthCalledWith(1, "td.w_no.ucsShare");
      expect(mock$TdNo).toHaveBeenCalledTimes(0);
      expect(mock$PName).toHaveBeenCalledTimes(0);
      expect(mock$TdUpload).toHaveBeenCalledTimes(0);
      expect(mockClose).toHaveBeenCalled();
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalled();
      expect(mockNewPage).toHaveBeenCalled();
      expect(mockWarn).toHaveBeenCalledWith(
        "[maker: maker1] td.w_no.ucsShare is null."
      );
    });

    it("Should return empty recent ucs list and empty notifications if p.t1 is null", async () => {
      mock$Tr
        .mockResolvedValueOnce({ innerText: mock$TdNo })
        .mockResolvedValueOnce(null);
      mock$Tbody.mockResolvedValueOnce({ $: mock$Tr });
      mock$Page.mockResolvedValueOnce({ $: mock$Tbody });

      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: {
            string: JSON.stringify({
              makers: ["maker1"],
              prev: [],
            }),
          },
        }),
        invocationContext
      );

      expect(response.status).toBe(200);
      expect(response.jsonBody).toStrictEqual({ recent: [], notification: [] });
      expect(mock$Page).toHaveBeenCalledWith("tbody");
      expect(mock$Tbody).toHaveBeenCalledWith("tr");
      expect(mock$Tr).toHaveBeenCalledTimes(2);
      expect(mock$Tr).toHaveBeenNthCalledWith(1, "td.w_no.ucsShare");
      expect(mock$Tr).toHaveBeenNthCalledWith(2, "p.t1");
      expect(mock$TdNo).toHaveBeenCalledTimes(0);
      expect(mock$PName).toHaveBeenCalledTimes(0);
      expect(mock$TdUpload).toHaveBeenCalledTimes(0);
      expect(mockClose).toHaveBeenCalled();
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalled();
      expect(mockNewPage).toHaveBeenCalled();
      expect(mockWarn).toHaveBeenCalledWith("[maker: maker1] p.t1 is null.");
    });

    it("Should return empty recent ucs list and empty notifications if td.w_upload is null", async () => {
      mock$Tr
        .mockResolvedValueOnce({ innerText: mock$TdNo })
        .mockResolvedValueOnce({ innerText: mock$PName })
        .mockResolvedValueOnce(null);
      mock$Tbody.mockResolvedValueOnce({ $: mock$Tr });
      mock$Page.mockResolvedValueOnce({ $: mock$Tbody });

      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: {
            string: JSON.stringify({
              makers: ["maker1"],
              prev: [],
            }),
          },
        }),
        invocationContext
      );

      expect(response.status).toBe(200);
      expect(response.jsonBody).toStrictEqual({ recent: [], notification: [] });
      expect(mock$Page).toHaveBeenCalledWith("tbody");
      expect(mock$Tbody).toHaveBeenCalledWith("tr");
      expect(mock$Tr).toHaveBeenCalledTimes(3);
      expect(mock$Tr).toHaveBeenNthCalledWith(1, "td.w_no.ucsShare");
      expect(mock$Tr).toHaveBeenNthCalledWith(2, "p.t1");
      expect(mock$Tr).toHaveBeenNthCalledWith(3, "td.w_upload");
      expect(mock$TdNo).toHaveBeenCalledTimes(0);
      expect(mock$PName).toHaveBeenCalledTimes(0);
      expect(mock$TdUpload).toHaveBeenCalledTimes(0);
      expect(mockClose).toHaveBeenCalled();
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalled();
      expect(mockNewPage).toHaveBeenCalled();
      expect(mockWarn).toHaveBeenCalledWith(
        "[maker: maker1] td.w_upload is null."
      );
    });

    it('Should return empty recent ucs list and empty notifications if "no" is not a number', async () => {
      mock$TdNo.mockResolvedValueOnce("a");
      mock$Tr
        .mockResolvedValueOnce({ innerText: mock$TdNo })
        .mockResolvedValueOnce({ innerText: mock$PName })
        .mockResolvedValueOnce({ innerText: mock$TdUpload });
      mock$Tbody.mockResolvedValueOnce({ $: mock$Tr });
      mock$Page.mockResolvedValueOnce({ $: mock$Tbody });

      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: {
            string: JSON.stringify({
              makers: ["maker1"],
              prev: [],
            }),
          },
        }),
        invocationContext
      );

      expect(response.status).toBe(200);
      expect(response.jsonBody).toStrictEqual({ recent: [], notification: [] });
      expect(mock$Page).toHaveBeenCalledWith("tbody");
      expect(mock$Tbody).toHaveBeenCalledWith("tr");
      expect(mock$Tr).toHaveBeenCalledTimes(3);
      expect(mock$Tr).toHaveBeenNthCalledWith(1, "td.w_no.ucsShare");
      expect(mock$Tr).toHaveBeenNthCalledWith(2, "p.t1");
      expect(mock$Tr).toHaveBeenNthCalledWith(3, "td.w_upload");
      expect(mock$TdNo).toHaveBeenCalled();
      expect(mock$PName).toHaveBeenCalledTimes(0);
      expect(mock$TdUpload).toHaveBeenCalledTimes(0);
      expect(mockClose).toHaveBeenCalled();
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalled();
      expect(mockNewPage).toHaveBeenCalled();
      expect(mockWarn).toHaveBeenCalledWith(
        '[maker: maker1] Variable "no" is NaN.'
      );
    });
  });
});
