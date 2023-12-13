/**
 * Request body of [PUT] /ucs/recent
 */
export type PutUcsRecentReq = {
  /**
   * UCS Maker Name
   */
  makers: string[];

  /**
   * Recent UCS List at Previous Execution
   */
  prev: Ucs[];
};

/**
 * Response body of [PUT] /ucs/recent
 */
export type PutUcsRecentRes = {
  /**
   * Recent UCS List at this Execution
   */
  recent: Ucs[];

  /**
   * Notification UCS List
   */
  notification: Ucs[];
};

/**
 * UCS
 */
export type Ucs = {
  /**
   * UCS Maker Name
   */
  maker: string;

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
