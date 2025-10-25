import type { Response } from 'express';

interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export const sendSuccess = <T>(res: Response, message: string, data?: T, statusCode = 200): void => {
  const response: ApiResponse<T> = {
    status: 'success',
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const sendError = (res: Response, message: string, statusCode = 400): void => {
  const response: ApiResponse = {
    status: 'error',
    message,
  };
  res.status(statusCode).json(response);
};
