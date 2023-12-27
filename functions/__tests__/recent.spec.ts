import { HttpRequest, HttpRequestInit } from "@azure/functions";
import { recent } from "../src/recent";
import { Browser, Page, chromium } from "playwright-chromium";

const httpRequestInitDefault: HttpRequestInit = {
  url: "http://localhost:7071/api/recent",
  method: "put",
};

jest.mock("playwright-chromium");

describe("[PUT] /recent", () => {
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
  });

  describe("Validation", () => {
    it("Should return 400 if the type of request body is not object", async () => {
      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: { string: JSON.stringify(0) },
        }),
        invocationContext
      );

      expect(response.status).toBe(400);
    });

    it("Should return 400 if there is a invalid attribute of request body", async () => {
      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: { string: JSON.stringify({ dummy: "dummy" }) },
        }),
        invocationContext
      );

      expect(response.status).toBe(400);
    });

    it("Should return 400 if the type of each makers is not string", async () => {
      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: { string: JSON.stringify({ makers: [0], prev: [] }) },
        }),
        invocationContext
      );

      expect(response.status).toBe(400);
    });

    it("Should return 400 if the type of previous ucs is not object", async () => {
      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: { string: JSON.stringify({ makers: [], prev: [0] }) },
        }),
        invocationContext
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
        invocationContext
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
        invocationContext
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
        invocationContext
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
        invocationContext
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
        invocationContext
      );

      expect(response.status).toBe(400);
    });
  });

  describe("Scraping", () => {
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

    beforeEach(() => {
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
        invocationContext
      );

      expect(response.status).toBe(200);
      expect(response.jsonBody).toStrictEqual({ recent: [], notification: [] });
      expect(mock$Page).toHaveBeenCalledTimes(0);
      expect(mock$Tbody).toHaveBeenCalledTimes(0);
      expect(mock$Tr).toHaveBeenCalledTimes(0);
      expect(mock$TdNo).toHaveBeenCalledTimes(0);
      expect(mock$PName).toHaveBeenCalledTimes(0);
      expect(mock$TdUpload).toHaveBeenCalledTimes(0);
      expect(mockClose).toHaveBeenCalledTimes(1);
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
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalledTimes(1);
      expect(mockNewPage).toHaveBeenCalledTimes(1);
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
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalledTimes(1);
      expect(mockNewPage).toHaveBeenCalledTimes(1);
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
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalledTimes(1);
      expect(mockNewPage).toHaveBeenCalledTimes(1);
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
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalledTimes(1);
      expect(mockNewPage).toHaveBeenCalledTimes(1);
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
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalledTimes(1);
      expect(mockNewPage).toHaveBeenCalledTimes(1);
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
      expect(mock$TdNo).toHaveBeenCalledTimes(1);
      expect(mock$PName).toHaveBeenCalledTimes(0);
      expect(mock$TdUpload).toHaveBeenCalledTimes(0);
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalledTimes(1);
      expect(mockNewPage).toHaveBeenCalledTimes(1);
      expect(mockWarn).toHaveBeenCalledWith(
        '[maker: maker1] Variable "no" is NaN.'
      );
    });

    it('Should return empty recent ucs list and empty notifications if "name" is empty', async () => {
      mock$PName.mockResolvedValueOnce("");
      mock$TdNo.mockResolvedValueOnce(1);
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
      expect(mock$TdNo).toHaveBeenCalledTimes(1);
      expect(mock$PName).toHaveBeenCalledTimes(1);
      expect(mock$TdUpload).toHaveBeenCalledTimes(0);
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalledTimes(1);
      expect(mockNewPage).toHaveBeenCalledTimes(1);
      expect(mockWarn).toHaveBeenCalledWith(
        '[maker: maker1] Variable "name" is empty.'
      );
    });

    it('Should return empty recent ucs list and empty notifications if "upload" is empty', async () => {
      mock$TdUpload.mockResolvedValueOnce("");
      mock$PName.mockResolvedValueOnce("name1");
      mock$TdNo.mockResolvedValueOnce(1);
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
      expect(mock$TdNo).toHaveBeenCalledTimes(1);
      expect(mock$PName).toHaveBeenCalledTimes(1);
      expect(mock$TdUpload).toHaveBeenCalledTimes(1);
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalledTimes(1);
      expect(mockNewPage).toHaveBeenCalledTimes(1);
      expect(mockWarn).toHaveBeenCalledWith(
        '[maker: maker1] Variable "upload" is empty.'
      );
    });

    it("Should return non-empty recent ucs list and empty notifications if previous ucs is empty", async () => {
      mock$TdUpload.mockResolvedValueOnce("upload1");
      mock$PName.mockResolvedValueOnce("name1");
      mock$TdNo.mockResolvedValueOnce(1);
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
      expect(response.jsonBody).toStrictEqual({
        recent: [
          {
            maker: "maker1",
            no: 1,
            name: "name1",
            upload: "upload1",
          },
        ],
        notification: [],
      });
      expect(mock$Page).toHaveBeenCalledWith("tbody");
      expect(mock$Tbody).toHaveBeenCalledWith("tr");
      expect(mock$Tr).toHaveBeenCalledTimes(3);
      expect(mock$Tr).toHaveBeenNthCalledWith(1, "td.w_no.ucsShare");
      expect(mock$Tr).toHaveBeenNthCalledWith(2, "p.t1");
      expect(mock$Tr).toHaveBeenNthCalledWith(3, "td.w_upload");
      expect(mock$TdNo).toHaveBeenCalledTimes(1);
      expect(mock$PName).toHaveBeenCalledTimes(1);
      expect(mock$TdUpload).toHaveBeenCalledTimes(1);
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalledTimes(1);
      expect(mockNewPage).toHaveBeenCalledTimes(1);
      expect(mockWarn).toHaveBeenCalledTimes(0);
    });

    it('Should return non-empty recent ucs list and empty notifications if "no" of previous ucs is equal to one of recent ucs', async () => {
      mock$TdUpload.mockResolvedValueOnce("upload1");
      mock$PName.mockResolvedValueOnce("name1");
      mock$TdNo.mockResolvedValueOnce(1);
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
              prev: [
                {
                  maker: "maker1",
                  no: 1,
                  name: "prev-name1",
                  upload: "prev-upload1",
                },
              ],
            }),
          },
        }),
        invocationContext
      );

      expect(response.status).toBe(200);
      expect(response.jsonBody).toStrictEqual({
        recent: [
          {
            maker: "maker1",
            no: 1,
            name: "name1",
            upload: "upload1",
          },
        ],
        notification: [],
      });
      expect(mock$Page).toHaveBeenCalledWith("tbody");
      expect(mock$Tbody).toHaveBeenCalledWith("tr");
      expect(mock$Tr).toHaveBeenCalledTimes(3);
      expect(mock$Tr).toHaveBeenNthCalledWith(1, "td.w_no.ucsShare");
      expect(mock$Tr).toHaveBeenNthCalledWith(2, "p.t1");
      expect(mock$Tr).toHaveBeenNthCalledWith(3, "td.w_upload");
      expect(mock$TdNo).toHaveBeenCalledTimes(1);
      expect(mock$PName).toHaveBeenCalledTimes(1);
      expect(mock$TdUpload).toHaveBeenCalledTimes(1);
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalledTimes(1);
      expect(mockNewPage).toHaveBeenCalledTimes(1);
      expect(mockWarn).toHaveBeenCalledTimes(0);
    });

    it('Should return non-empty recent ucs list and notifications if "no" of previous ucs is differ to one of recent ucs', async () => {
      mock$TdUpload.mockResolvedValueOnce("upload1");
      mock$PName.mockResolvedValueOnce("name1");
      mock$TdNo.mockResolvedValueOnce(1);
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
              prev: [
                {
                  maker: "maker1",
                  no: 11,
                  name: "prev-name1",
                  upload: "prev-upload1",
                },
              ],
            }),
          },
        }),
        invocationContext
      );

      expect(response.status).toBe(200);
      expect(response.jsonBody).toStrictEqual({
        recent: [
          {
            maker: "maker1",
            no: 1,
            name: "name1",
            upload: "upload1",
          },
        ],
        notification: [
          {
            maker: "maker1",
            no: 1,
            name: "name1",
            upload: "upload1",
          },
        ],
      });
      expect(mock$Page).toHaveBeenCalledWith("tbody");
      expect(mock$Tbody).toHaveBeenCalledWith("tr");
      expect(mock$Tr).toHaveBeenCalledTimes(3);
      expect(mock$Tr).toHaveBeenNthCalledWith(1, "td.w_no.ucsShare");
      expect(mock$Tr).toHaveBeenNthCalledWith(2, "p.t1");
      expect(mock$Tr).toHaveBeenNthCalledWith(3, "td.w_upload");
      expect(mock$TdNo).toHaveBeenCalledTimes(1);
      expect(mock$PName).toHaveBeenCalledTimes(1);
      expect(mock$TdUpload).toHaveBeenCalledTimes(1);
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockGoto).toHaveBeenCalledWith(
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockNewContext).toHaveBeenCalledTimes(1);
      expect(mockNewPage).toHaveBeenCalledTimes(1);
      expect(mockWarn).toHaveBeenCalledTimes(0);
    });

    it("Should return valid recent ucs list and notifications if makers are mixed", async () => {
      mock$TdUpload
        .mockResolvedValueOnce("upload1")
        .mockResolvedValueOnce("upload2")
        .mockResolvedValueOnce("upload3");
      mock$PName
        .mockResolvedValueOnce("name1")
        .mockResolvedValueOnce("name2")
        .mockResolvedValueOnce("name3");
      mock$TdNo
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3);
      mock$Tr
        .mockResolvedValueOnce({ innerText: mock$TdNo })
        .mockResolvedValueOnce({ innerText: mock$PName })
        .mockResolvedValueOnce({ innerText: mock$TdUpload })
        .mockResolvedValueOnce({ innerText: mock$TdNo })
        .mockResolvedValueOnce({ innerText: mock$PName })
        .mockResolvedValueOnce({ innerText: mock$TdUpload })
        .mockResolvedValueOnce({ innerText: mock$TdNo })
        .mockResolvedValueOnce({ innerText: mock$PName })
        .mockResolvedValueOnce({ innerText: mock$TdUpload });
      mock$Tbody
        .mockResolvedValueOnce({ $: mock$Tr })
        .mockResolvedValueOnce({ $: mock$Tr })
        .mockResolvedValueOnce({ $: mock$Tr });
      mock$Page
        .mockResolvedValueOnce({ $: mock$Tbody })
        .mockResolvedValueOnce({ $: mock$Tbody })
        .mockResolvedValueOnce({ $: mock$Tbody });

      const response = await recent(
        new HttpRequest({
          ...httpRequestInitDefault,
          body: {
            string: JSON.stringify({
              makers: ["maker1", "maker2", "maker3"],
              prev: [
                {
                  maker: "maker1",
                  no: 11,
                  name: "prev-name1",
                  upload: "prev-upload1",
                },
                {
                  maker: "maker3",
                  no: 3,
                  name: "prev-name3",
                  upload: "prev-upload3",
                },
                {
                  maker: "maker4",
                  no: 4,
                  name: "prev-name4",
                  upload: "prev-upload4",
                },
              ],
            }),
          },
        }),
        invocationContext
      );

      expect(response.status).toBe(200);
      expect(response.jsonBody).toStrictEqual({
        recent: [
          {
            maker: "maker1",
            no: 1,
            name: "name1",
            upload: "upload1",
          },
          {
            maker: "maker2",
            no: 2,
            name: "name2",
            upload: "upload2",
          },
          {
            maker: "maker3",
            no: 3,
            name: "name3",
            upload: "upload3",
          },
        ],
        notification: [
          {
            maker: "maker1",
            no: 1,
            name: "name1",
            upload: "upload1",
          },
        ],
      });
      expect(mock$Page).toHaveBeenCalledTimes(3);
      expect(mock$Page).toHaveBeenNthCalledWith(1, "tbody");
      expect(mock$Page).toHaveBeenNthCalledWith(2, "tbody");
      expect(mock$Page).toHaveBeenNthCalledWith(3, "tbody");
      expect(mock$Tbody).toHaveBeenCalledTimes(3);
      expect(mock$Tbody).toHaveBeenNthCalledWith(1, "tr");
      expect(mock$Tbody).toHaveBeenNthCalledWith(2, "tr");
      expect(mock$Tbody).toHaveBeenNthCalledWith(3, "tr");
      expect(mock$Tr).toHaveBeenCalledTimes(9);
      expect(mock$Tr).toHaveBeenNthCalledWith(1, "td.w_no.ucsShare");
      expect(mock$Tr).toHaveBeenNthCalledWith(2, "p.t1");
      expect(mock$Tr).toHaveBeenNthCalledWith(3, "td.w_upload");
      expect(mock$Tr).toHaveBeenNthCalledWith(4, "td.w_no.ucsShare");
      expect(mock$Tr).toHaveBeenNthCalledWith(5, "p.t1");
      expect(mock$Tr).toHaveBeenNthCalledWith(6, "td.w_upload");
      expect(mock$Tr).toHaveBeenNthCalledWith(7, "td.w_no.ucsShare");
      expect(mock$Tr).toHaveBeenNthCalledWith(8, "p.t1");
      expect(mock$Tr).toHaveBeenNthCalledWith(9, "td.w_upload");
      expect(mock$TdNo).toHaveBeenCalledTimes(3);
      expect(mock$PName).toHaveBeenCalledTimes(3);
      expect(mock$TdUpload).toHaveBeenCalledTimes(3);
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockGoto).toHaveBeenCalledTimes(3);
      expect(mockGoto).toHaveBeenNthCalledWith(
        1,
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker1"
      );
      expect(mockGoto).toHaveBeenNthCalledWith(
        2,
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker2"
      );
      expect(mockGoto).toHaveBeenNthCalledWith(
        3,
        "https://ucs.piugame.com/ucs_share?s_type=maker&s_val=maker3"
      );
      expect(mockNewContext).toHaveBeenCalledTimes(3);
      expect(mockNewPage).toHaveBeenCalledTimes(3);
      expect(mockWarn).toHaveBeenCalledTimes(0);
    });
  });
});
