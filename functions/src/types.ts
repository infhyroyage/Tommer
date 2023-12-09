/**
 * Request body of [PUT] /ucs/recent
 */
export type PutUcsRecentReq = {
  /**
   * UCS Number per Maker
   */
  [maker: string]: number;
};

/**
 * Response body of [PUT] /ucs/recent
 */
export type PutUcsRecentRes = {
  /**
   * Request Body of [PUT] /ucs/recent for Next Execution
   */
  next: PutUcsRecentReq;

  /**
   * Recent UCS List to Notificate by Azure Logic Apps
   */
  notification: {
    [maker: string]: Ucs;
  };
};

/**
 * UCS
 */
export type Ucs = {
  /**
   * UCS Number
   */
  no: number;

  /**
   * Song Name
   */
  name: string;

  /**
   * Uploaded Date
   */
  upload: string;
};
