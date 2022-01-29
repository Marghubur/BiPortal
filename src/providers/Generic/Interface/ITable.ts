import { IGrid } from "./IGrid";

export interface ITable {
  rows: Array<IGrid>;
  url: string;
  SearchStr: string;
  SortBy?: string;
  editUrl?: string;
}
