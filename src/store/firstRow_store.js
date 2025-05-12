// store/firstRow_store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFirstRowStore = create(
  persist(
    (set, get) => ({
      headers: [],
      setHeaders: (headers) => set({ headers }),
      getHeaderInfo: () => {
        const headers = get().headers;
        return headers.map((header, index) => `${index + 1}번 셀(인덱스 ${index}): ${header}`).join(', ');
      },
      clearHeaders: () => set({ headers: [] }),
      updateHeader: (index, newValue) => {
        const currentHeaders = get().headers;
        const newHeaders = [...currentHeaders];
        newHeaders[index] = newValue;
        set({ headers: newHeaders });
      }
    }),
    {
      name: 'spreadsheet-headers'
    }
  )
);
