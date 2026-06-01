import { AxiosResponse, AxiosError } from "axios";

/**
 * A robust wrapper for API calls that:
 * 1. Extracts the data from AxiosResponse
 * 2. Catches Axios errors and extracts server-side validation messages
 * 3. Ensures TypeScript knows exactly what data type is being returned
 */
export async function handleApi<T>(
  request: Promise<AxiosResponse<T>>
): Promise<T> {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      // Extract the FastAPI "detail" error if it exists
      const serverError = error.response?.data;
      
      // We THROW the error so that:
      // 1. TypeScript return type remains strictly 'T' (not T | Error)
      // 2. React Query's onError and isError triggers correctly
      throw serverError || new Error(error.message);
    }
    throw error;
  }
}