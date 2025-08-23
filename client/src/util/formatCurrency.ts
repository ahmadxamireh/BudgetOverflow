// format currency with ₪ symbol
export const formatCurrency = (value: number): string =>
    `₪ ${ value.toLocaleString("en-US", { minimumFractionDigits: 2 }) }`;