import { cafeConfig } from '../config/business';

/**
 * Safely retrieves public frontend configuration sourced from environment variables.
 */
export const getSupportEmail = (): string => {
  return cafeConfig.getEmail() || '';
};
