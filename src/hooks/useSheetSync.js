import { useState, useCallback } from 'react';

/**
 * Hook for fetching and parsing CSV data from Google Sheets.
 */
export function useSheetSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseCSV = useCallback((text) => {
    const rows = [];
    let cur = '';
    let inQuote = false;
    let currentRow = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuote && next === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (char === ',' && !inQuote) {
        currentRow.push(cur.trim());
        cur = '';
      } else if (char === '\n' && !inQuote) {
        currentRow.push(cur.trim());
        rows.push(currentRow);
        currentRow = [];
        cur = '';
      } else if (char !== '\r') {
        cur += char;
      }
    }
    if (cur || currentRow.length) {
      currentRow.push(cur.trim());
      rows.push(currentRow);
    }
    return rows;
  }, []);

  const fetchSheetData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQcahiqDZXfIuW9clbf2XH0UNr7jcL6rOmui7Wn9Q3AkOcq3Fb_SKrxM1QbphTipFh4kmZIES7wsf4f/pub?output=csv');
      if (!response.ok) throw new Error('Failed to fetch sheet data');
      
      const csvText = await response.text();
      const allRows = parseCSV(csvText);
      
      if (allRows.length < 2) return [];

      const headers = allRows[0];
      const data = allRows[1];
      const newSlides = [];

      for (let i = 3; i < headers.length; i++) {
        if (headers[i] && data[i]) {
          newSlides.push({
            id: `sheet-${i}`,
            date: headers[i],
            title: 'Daily Log',
            content: data[i],
          });
        }
      }
      return newSlides;
    } catch (err) {
      setError(err.message);
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [parseCSV]);

  return { fetchSheetData, isLoading, error };
}
