/**
 * SQL lab dataset: a small, fully synthetic e-commerce schema. Deliberately contains data
 * quality problems (a duplicate customer email, an orphan order item, a payment mismatch,
 * a NULL email) so learners can practise data-validation queries.
 */

export const SQL_SCHEMA = `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  country TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  status TEXT NOT NULL CHECK (status IN ('PLACED','PAID','SHIPPED','CANCELLED','REFUNDED')),
  order_date TEXT NOT NULL,
  total REAL NOT NULL
);
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL
);
CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  amount REAL NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('SUCCESS','FAILED','REFUNDED'))
);
`;

export const SQL_SEED = `
INSERT INTO customers VALUES
 (1,'Asha Rao','asha@example.com','IN','2026-01-05'),
 (2,'Ben Carter','ben@example.com','UK','2026-01-11'),
 (3,'Chen Wei','chen@example.com','SG','2026-02-02'),
 (4,'Diana Lopez','diana@example.com','US','2026-02-14'),
 (5,'Elif Kaya',NULL,'TR','2026-03-01'),
 (6,'Farah Khan','asha@example.com','IN','2026-03-09'),
 (7,'Gopal Iyer','gopal@example.com','IN','2026-03-20');

INSERT INTO products VALUES
 (1,'KB-100','Mechanical Keyboard','Accessories',79.00),
 (2,'MS-200','Wireless Mouse','Accessories',25.50),
 (3,'MN-270','27-inch Monitor','Displays',249.99),
 (4,'HD-500','USB-C Hub','Accessories',39.00),
 (5,'LP-900','Laptop Stand','Furniture',45.00),
 (6,'CH-300','Ergonomic Chair','Furniture',310.00);

INSERT INTO orders VALUES
 (101,1,'PAID','2026-03-01',104.50),
 (102,2,'SHIPPED','2026-03-03',249.99),
 (103,1,'CANCELLED','2026-03-05',39.00),
 (104,3,'PAID','2026-03-07',355.00),
 (105,4,'PLACED','2026-03-10',89.00),
 (106,7,'PAID','2026-03-12',51.00),
 (107,2,'REFUNDED','2026-03-15',310.00),
 (108,3,'SHIPPED','2026-03-18',288.99),
 (109,4,'PAID','2026-03-20',25.50);

INSERT INTO order_items VALUES
 (1,101,1,1,79.00),
 (2,101,2,1,25.50),
 (3,102,3,1,249.99),
 (4,103,4,1,39.00),
 (5,104,6,1,310.00),
 (6,104,5,1,45.00),
 (7,105,1,1,79.00),
 (8,106,2,2,25.50),
 (9,107,6,1,310.00),
 (10,108,3,1,249.99),
 (11,108,4,1,39.00),
 (12,999,2,1,25.50),
 (13,109,2,1,25.50);

INSERT INTO payments VALUES
 (1,101,104.50,'CARD','SUCCESS'),
 (2,102,249.99,'UPI','SUCCESS'),
 (3,104,355.00,'CARD','SUCCESS'),
 (4,106,50.00,'CARD','SUCCESS'),
 (5,107,310.00,'CARD','REFUNDED'),
 (6,108,288.99,'NETBANKING','SUCCESS'),
 (7,105,79.00,'CARD','FAILED');
`;

export interface SqlExercise {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  prompt: string;
  hint: string;
  solution: string;
  /** When false, rows are compared as a multiset (order ignored). */
  ordered: boolean;
}

export const SQL_EXERCISES: SqlExercise[] = [
  {
    id: "sql-01",
    title: "Customers from India",
    level: "beginner",
    prompt: "List the id and name of every customer whose country is 'IN'.",
    hint: "SELECT … FROM customers WHERE …",
    solution: "SELECT id, name FROM customers WHERE country = 'IN';",
    ordered: false,
  },
  {
    id: "sql-02",
    title: "Most expensive products",
    level: "beginner",
    prompt: "Show sku, name and price of all products priced above 50, most expensive first.",
    hint: "Use WHERE and ORDER BY … DESC.",
    solution: "SELECT sku, name, price FROM products WHERE price > 50 ORDER BY price DESC;",
    ordered: true,
  },
  {
    id: "sql-03",
    title: "Orders per status",
    level: "beginner",
    prompt: "Count orders per status. Return status and the count (name the column order_count).",
    hint: "GROUP BY status with COUNT(*).",
    solution: "SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status;",
    ordered: false,
  },
  {
    id: "sql-04",
    title: "Orders with customer names",
    level: "intermediate",
    prompt: "List every order id with its customer's name and the order total.",
    hint: "INNER JOIN orders to customers on customer_id.",
    solution: "SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id;",
    ordered: false,
  },
  {
    id: "sql-05",
    title: "Customers who never ordered",
    level: "intermediate",
    prompt: "Find the id and name of customers who have no orders at all.",
    hint: "LEFT JOIN orders and keep rows where the order side IS NULL.",
    solution: "SELECT c.id, c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;",
    ordered: false,
  },
  {
    id: "sql-06",
    title: "Revenue by category",
    level: "intermediate",
    prompt:
      "For orders with status PAID or SHIPPED, total the line revenue (quantity × unit_price) per product category. Return category and revenue, highest revenue first.",
    hint: "Join order_items → orders (filter status) and → products, then GROUP BY category.",
    solution:
      "SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE o.status IN ('PAID','SHIPPED') GROUP BY p.category ORDER BY revenue DESC;",
    ordered: true,
  },
  {
    id: "sql-07",
    title: "Data validation: duplicate emails",
    level: "intermediate",
    prompt: "Data quality check: find any email address used by more than one customer. Return email and how many customers use it (as uses).",
    hint: "GROUP BY email HAVING COUNT(*) > 1. Remember NULLs group together but are not duplicates of a real email.",
    solution: "SELECT email, COUNT(*) AS uses FROM customers WHERE email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1;",
    ordered: false,
  },
  {
    id: "sql-08",
    title: "Data validation: orphan order items",
    level: "intermediate",
    prompt: "Find order_items rows whose order_id does not exist in orders. Return the order item id and its order_id.",
    hint: "LEFT JOIN orders and look for missing matches.",
    solution: "SELECT oi.id, oi.order_id FROM order_items oi LEFT JOIN orders o ON o.id = oi.order_id WHERE o.id IS NULL;",
    ordered: false,
  },
  {
    id: "sql-09",
    title: "Reconciliation: order total vs line items",
    level: "advanced",
    prompt:
      "Find orders whose stored total differs from the sum of their line items (quantity × unit_price). Return order id, total and the computed line total (as line_total, rounded to 2 decimals).",
    hint: "Aggregate order_items per order_id, join to orders, compare with a small tolerance.",
    solution:
      "SELECT o.id, o.total, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS line_total FROM orders o JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id, o.total HAVING ABS(o.total - SUM(oi.quantity * oi.unit_price)) > 0.005;",
    ordered: false,
  },
  {
    id: "sql-10",
    title: "Reconciliation: successful payments vs order totals",
    level: "advanced",
    prompt:
      "Find orders that have a SUCCESS payment whose amount does not equal the order total. Return order id, order total and payment amount.",
    hint: "JOIN orders to payments, filter payment status, compare amounts.",
    solution:
      "SELECT o.id, o.total, p.amount FROM orders o JOIN payments p ON p.order_id = o.id WHERE p.status = 'SUCCESS' AND ABS(o.total - p.amount) > 0.005;",
    ordered: false,
  },
  {
    id: "sql-11",
    title: "Paid orders without a successful payment",
    level: "advanced",
    prompt: "Find orders in status PAID or SHIPPED that have no SUCCESS payment. Return the order id and status.",
    hint: "NOT EXISTS with a correlated subquery on payments.",
    solution:
      "SELECT o.id, o.status FROM orders o WHERE o.status IN ('PAID','SHIPPED') AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.order_id = o.id AND p.status = 'SUCCESS');",
    ordered: false,
  },
  {
    id: "sql-12",
    title: "Top customer by spend",
    level: "advanced",
    prompt:
      "Excluding CANCELLED and REFUNDED orders, which customer has the highest total spend? Return name and total_spend for the single top customer.",
    hint: "Join, filter, GROUP BY customer, ORDER BY … DESC LIMIT 1.",
    solution:
      "SELECT c.name, ROUND(SUM(o.total), 2) AS total_spend FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status NOT IN ('CANCELLED','REFUNDED') GROUP BY c.id, c.name ORDER BY total_spend DESC LIMIT 1;",
    ordered: true,
  },
];

/** Reject statements that would modify the sandbox, so exercises stay reproducible. */
export function isReadOnlySql(sql: string): boolean {
  const stripped = sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim()
    .toLowerCase();
  if (!stripped) return false;
  const statements = stripped.split(";").map((s) => s.trim()).filter(Boolean);
  return statements.every((s) => /^(select|with)\b/.test(s) && !/\b(insert|update|delete|drop|alter|create|attach|pragma|replace)\b/.test(s));
}

export type Row = (string | number | null)[];

/** Compare two result sets, optionally ignoring row order. Numbers compared with a small tolerance. */
export function sameResult(a: { columns: string[]; rows: Row[] }, b: { columns: string[]; rows: Row[] }, ordered: boolean): boolean {
  if (a.columns.length !== b.columns.length || a.rows.length !== b.rows.length) return false;
  const norm = (row: Row) => row.map((v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v));
  const ra = a.rows.map((r) => JSON.stringify(norm(r)));
  const rb = b.rows.map((r) => JSON.stringify(norm(r)));
  if (ordered) return ra.every((r, i) => r === rb[i]);
  const sa = [...ra].sort();
  const sb = [...rb].sort();
  return sa.every((r, i) => r === sb[i]);
}
