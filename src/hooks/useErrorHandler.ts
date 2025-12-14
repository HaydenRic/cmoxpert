import { useCallback } from 'react';

export default function useErrorHandler() {
  return useCallback((err: unknown) => {
    console.error(err);
  }, []);
}
import { useCallback } from 'react';

export default function useErrorHandler() {
  return useCallback((err: unknown) => {
    console.error(err);
  }, []);
}
