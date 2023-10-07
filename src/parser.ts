import {
  DataObject,
  FetchRawDataOptions,
  GoogleSheetEntry,
  GoogleSheetTable,
  RawQueryResponse,
} from "./types.ts";

export class GoogleSheet
  implements Readonly<GoogleSheetTable>, Iterable<GoogleSheetEntry> {
  readonly #table: GoogleSheetTable;

  static async fetch(
    spreadsheetId: string,
    { sheetName, sheetId }: FetchRawDataOptions = {},
  ): Promise<GoogleSheet> {
    const url = new URL(
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq`,
    );

    if (sheetName) {
      url.searchParams.set("sheet", sheetName);
    } else if (sheetId) {
      url.searchParams.set("gid", sheetId);
    }

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }

    const rawText = await res.text();

    const matchedJson = rawText.match(
      /google\.visualization\.Query\.setResponse\((.*)\);$/s,
    );

    if (!matchedJson?.[1]) {
      throw new Error("Failed to extract data");
    }

    try {
      const rawJson: RawQueryResponse = JSON.parse(matchedJson[1]);
      return new GoogleSheet(rawJson.table);
    } catch (cause) {
      throw new Error("Failed to parse JSON", { cause });
    }
  }

  private constructor(dataObj: DataObject) {
    this.#table = {
      columns: dataObj.cols.map((col) => col.label || col.id),
      rows: dataObj.rows.map((row) =>
        row.c.map((cell) => <string | undefined> (cell?.f ?? cell?.v) ?? null)
      ),
    };
  }

  get columns(): string[] {
    return this.#table.columns;
  }

  get rows(): (string | null)[][] {
    return this.#table.rows;
  }

  entries(): GoogleSheetEntry[] {
    const entries: GoogleSheetEntry[] = [];
    for (const entry of this) {
      entries.push(entry);
    }
    return entries;
  }

  *[Symbol.iterator](): IterableIterator<GoogleSheetEntry> {
    for (const row of this.rows) {
      const entry: GoogleSheetEntry = {};
      for (const [i, key] of this.columns.entries()) {
        const value = row[i];
        if (value === null) continue;
        entry[key] = value;
      }
      yield entry;
    }
  }

  toJSON(): GoogleSheetTable {
    return this.#table;
  }
}
