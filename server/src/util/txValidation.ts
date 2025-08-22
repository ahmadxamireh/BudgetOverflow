// allowed transaction types
export type TxType = "income" | "expense";

// validate that a date is ISO-like
// this accepts "YYYY-MM-DD" and full ISO timestamps
export const isValidIsoDate = (date: string): boolean => {
    const ymd = /^\d{4}-\d{2}-\d{2}$/; // match YYYY-MM-DD format
    return ymd.test(date) || !Number.isNaN(Date.parse(date)); // Date.parse returns NaN for invalid strings
}

// type guard to ensure user input matches exactly "income" or "expense"
export const isValidTxType = (t: unknown): t is TxType =>
    t === "income" || t === "expense";

// parsing inputs from request params/query strings, avoids converting empty strings to 0
export const num = (val: unknown) => {
    if (typeof val === "number") return val;
    if (typeof val === "string" && val.trim() !== "") return Number(val);
    return NaN;
}