// @vitest-environment node
import path from "node:path";
import initSqlJs from "sql.js";
import { beforeAll, describe, expect, it } from "vitest";
import { isReadOnlySql, sameResult, SQL_EXERCISES, SQL_SCHEMA, SQL_SEED, type Row } from "./sql-data";

let run: (sql: string) => { columns: string[]; rows: Row[] };

beforeAll(async () => {
  const SQL = await initSqlJs({ locateFile: (f) => path.join(process.cwd(), "node_modules/sql.js/dist", f) });
  const db = new SQL.Database();
  db.run(SQL_SCHEMA);
  db.run(SQL_SEED);
  run = (sql) => {
    const res = db.exec(sql);
    return res.length ? { columns: res[0].columns, rows: res[0].values as Row[] } : { columns: [], rows: [] };
  };
});

describe("SQL lab dataset and exercises", () => {
  it.each(SQL_EXERCISES.map((e) => [e.id, e] as const))("%s solution runs and returns rows", (_id, ex) => {
    const result = run(ex.solution);
    expect(result.rows.length, ex.id).toBeGreaterThan(0);
  });

  it("produces the intended answers for the data-quality exercises", () => {
    expect(run(SQL_EXERCISES.find((e) => e.id === "sql-07")!.solution).rows).toEqual([["asha@example.com", 2]]);
    expect(run(SQL_EXERCISES.find((e) => e.id === "sql-08")!.solution).rows).toEqual([[12, 999]]);
    expect(run(SQL_EXERCISES.find((e) => e.id === "sql-05")!.solution).rows).toEqual([
      [5, "Elif Kaya"],
      [6, "Farah Khan"],
    ]);
    // Order 106: 2 × 25.50 = 51.00 matches total; payment of 50.00 is the mismatch.
    expect(run(SQL_EXERCISES.find((e) => e.id === "sql-10")!.solution).rows).toEqual([[106, 51, 50]]);
    // Order 105 is stored as 89.00 but its only line item is 79.00.
    expect(run(SQL_EXERCISES.find((e) => e.id === "sql-09")!.solution).rows).toEqual([[105, 89, 79]]);
    // Order 109 is PAID but has no payment at all.
    expect(run(SQL_EXERCISES.find((e) => e.id === "sql-11")!.solution).rows).toEqual([[109, "PAID"]]);
  });

  it("accepts an equivalent query written differently", () => {
    const ex = SQL_EXERCISES.find((e) => e.id === "sql-05")!;
    const alt = run("SELECT id, name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)");
    expect(sameResult(alt, run(ex.solution), ex.ordered)).toBe(true);
  });

  it("only allows read-only statements", () => {
    expect(isReadOnlySql("SELECT * FROM orders")).toBe(true);
    expect(isReadOnlySql("WITH x AS (SELECT 1) SELECT * FROM x")).toBe(true);
    expect(isReadOnlySql("DELETE FROM orders")).toBe(false);
    expect(isReadOnlySql("SELECT 1; DROP TABLE orders")).toBe(false);
    expect(isReadOnlySql("")).toBe(false);
  });
});
