/**
 * Application-wide constants
 */

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Response Messages
export const MESSAGES = {
  // Success messages
  SUCCESS: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    FETCHED: 'Resource fetched successfully',
  },
  // Error messages
  ERROR: {
    INTERNAL_SERVER: 'Internal server error',
    NOT_FOUND: 'Resource not found',
    INVALID_INPUT: 'Invalid input provided',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    CONFLICT: 'Resource already exists',
    VALIDATION_FAILED: 'Validation failed',
  },
  // Auth messages
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    TOKEN_INVALID: 'Invalid or expired token',
    TOKEN_MISSING: 'No token provided',
    CREDENTIALS_INVALID: 'Invalid credentials',
    USER_NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'Email already registered',
  },
} as const;

// Validation constraints
export const VALIDATION = {
  EMAIL: {
    MAX_LENGTH: 255,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
  },
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  SEARCH: {
    MAX_LENGTH: 100,
  },
  URL: {
    MAX_LENGTH: 2048,
  },
  ALLOY: {
    NAME_MAX_LENGTH: 200,
    SPECS_MAX_LENGTH: 100,
    DIAMETER_MIN: 10,
    DIAMETER_MAX: 30,
    WIDTH_MIN: 5,
    WIDTH_MAX: 20,
    OFFSET_MIN: -50,
    OFFSET_MAX: 100,
  },
} as const;

// Database
export const DATABASE = {
  POOL: {
    MAX: 10,
    MIN: 0,
    ACQUIRE: 30000,
    IDLE: 10000,
  },
} as const;

// Rate limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  MESSAGE: 'Too many requests, please try again later',
} as const;

// JWT
export const JWT = {
  ALGORITHM: 'HS256',
  ISSUER: 'wheel-match-admin',
} as const;

// CORS
export const CORS_OPTIONS = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  optionsSuccessStatus: 200,
} as const;

// API Versioning
export const API_VERSION = {
  V1: '/api/v1',
} as const;
