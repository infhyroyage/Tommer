export type PutUcsRecent = {
  [maker: string]: Ucs;
};

export type Ucs = {
  no: number;
  name: string;
  upload: string;
};
