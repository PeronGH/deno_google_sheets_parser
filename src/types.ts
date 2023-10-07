export type FetchRawDataOptions = {
  sheetName?: string;
  sheetId?: string;
};

export interface RawQueryResponse {
  version: string;
  reqId: string;
  status: string;
  sig: string;
  table: DataObject;
}

export interface DataObject {
  cols: DataObjectColumn[];
  rows: DataObjectRow[];
  parsedNumHeaders: number;
}

export interface DataObjectColumn {
  id: string;
  label: string;
  type: string;
  pattern?: string;
}

export interface DataObjectRow {
  c: (DataObjectCell | null)[];
}

export interface DataObjectCell {
  v?: string | number | boolean;
  f?: string;
}

export interface GoogleSheetTable {
  columns: string[];
  rows: (string | null)[][];
}

export type GoogleSheetEntry = Record<string, string>;

export interface GoogleSheetCell {
  name?: string; // name of column
  value?: string; // value of cell
}
