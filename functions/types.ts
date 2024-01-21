/**
 * Request body of [PUT] /recent
 */
export type PutRecentReq = {
  /**
   * UCS Maker Name
   */
  makers: string[];

  /**
   * Previous UCS List
   */
  prev: Ucs[];
};

/**
 * Response body of [PUT] /recent
 */
export type PutRecentRes = {
  /**
   * Recent UCS List
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
