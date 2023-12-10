/**
 * Request body of [PUT] /ucs/recent
 */
export type PutUcsRecentReq = {
  /**
   * UCS Maker Name
   */
  maker: string;

  /**
   * UCS Number
   * -1 for initial value
   */
  no: number;
}[];

/**
 * Response body of [PUT] /ucs/recent
 */
export type PutUcsRecentRes = {
  /**
   * Request Body of [PUT] /ucs/recent for Next Execution
   */
  next: PutUcsRecentReq;

  /**
   * UCS List for Notification
   */
  notifications: Ucs[];
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
