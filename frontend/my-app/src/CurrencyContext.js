import React, { createContext, useContext, useState } from "react";

export const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "CA$", AUD: "A$",
  CHF: "Fr", CNY: "¥", INR: "₹", PKR: "₨", MXN: "MX$", BRL: "R$",
  SGD: "S$", HKD: "HK$", NOK: "kr", SEK: "kr", DKK: "kr",
  NZD: "NZ$", ZAR: "R", AED: "د.إ",
};

export const CURRENCY_LIST = Object.keys(CURRENCY_SYMBOLS);

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem("preferred_currency") || "USD"
  );

  const setCurrency = (c) => {
    setCurrencyState(c);
    localStorage.setItem("preferred_currency", c);
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      symbol: CURRENCY_SYMBOLS[currency] || "$",
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
