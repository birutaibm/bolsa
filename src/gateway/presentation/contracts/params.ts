export type Params = Partial<AllParams>;

type AllParams = {
  header: StringMap;
  body: StringMap;
  query: StringMap;
  route: StringMap;
};

type StringMap = {
  [key: string]: string;
};
