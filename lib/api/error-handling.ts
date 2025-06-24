import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// ✅ Types per response standardizzate
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  path?: string
}

export interface ApiError {
  code: string
  message: string
  statusCode: number
  details?: any
}

// ✅ Error codes standardizzati
export const API_ERROR_CODES = {
  // Client errors (4xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Server errors (5xx)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const

// ✅ Success response creator
export function createSuccessResponse<T>(
  data: T, 
  message?: string,
  path?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    path
  })
}

// ✅ Error response creator
export function createErrorResponse(
  error: string | ApiError,
  statusCode: number = 500,
  path?: string
): NextResponse<ApiResponse> {
  const errorData = typeof error === 'string' 
    ? { code: 'UNKNOWN_ERROR', message: error, statusCode }
    : error

  return NextResponse.json({
    success: false,
    error: errorData.message,
    timestamp: new Date().toISOString(),
    path
  }, { 
    status: statusCode 
  })
}

// ✅ Validation error handler
export function handleValidationError(
  error: ZodError,
  path?: string
): NextResponse<ApiResponse> {
  const message = error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join(', ')

  return createErrorResponse({
    code: API_ERROR_CODES.VALIDATION_ERROR,
    message: `Validation failed: ${message}`,
    statusCode: 400,
    details: error.errors
  }, 400, path)
}

// ✅ Database error handler
export function handleDatabaseError(
  error: any,
  path?: string
): NextResponse<ApiResponse> {
  console.error('Database error:', error)

  // Non esporre dettagli database in produzione
  const message = process.env.NODE_ENV === 'production'
    ? 'Database operation failed'
    : error.message

  return createErrorResponse({
    code: API_ERROR_CODES.DATABASE_ERROR,
    message,
    statusCode: 500
  }, 500, path)
}

// ✅ Authorization error handler  
export function handleAuthError(
  message: string = 'Authentication required',
  path?: string
): NextResponse<ApiResponse> {
  return createErrorResponse({
    code: API_ERROR_CODES.UNAUTHORIZED,
    message,
    statusCode: 401
  }, 401, path)
}

// ✅ Forbidden error handler
export function handleForbiddenError(
  message: string = 'Insufficient permissions',
  path?: string
): NextResponse<ApiResponse> {
  return createErrorResponse({
    code: API_ERROR_CODES.FORBIDDEN,
    message,
    statusCode: 403
  }, 403, path)
}

// ✅ Not found error handler
export function handleNotFoundError(
  resource: string = 'Resource',
  path?: string
): NextResponse<ApiResponse> {
  return createErrorResponse({
    code: API_ERROR_CODES.NOT_FOUND,
    message: `${resource} not found`,
    statusCode: 404
  }, 404, path)
}

// ✅ Generic error handler per API routes
export function handleApiError(
  error: unknown,
  path?: string
): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return handleValidationError(error, path)
  }

  // Known API errors
  if (error && typeof error === 'object' && 'code' in error) {
    const apiError = error as ApiError
    return createErrorResponse(apiError, apiError.statusCode, path)
  }

  // Generic errors
  const message = error instanceof Error 
    ? error.message 
    : 'An unexpected error occurred'

  return createErrorResponse({
    code: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    message,
    statusCode: 500
  }, 500, path)
}

// ✅ Wrapper per API routes con error handling automatico
export function withErrorHandling(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleApiError(error, request.url)
    }
  }
}

// ✅ Middleware per logging
export function withRequestLogging(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    const start = Date.now()
    const { method, url } = request
    
    console.log(`🚀 API ${method} ${url} - Started`)
    
    try {
      const response = await handler(request, context)
      const duration = Date.now() - start
      
      console.log(`✅ API ${method} ${url} - ${response.status} (${duration}ms)`)
      
      return response
    } catch (error) {
      const duration = Date.now() - start
      
      console.error(`❌ API ${method} ${url} - Error (${duration}ms):`, error)
      
      throw error
    }
  }
}

// ✅ Combined wrapper
export function withApiHandlers(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return withRequestLogging(withErrorHandling(handler))
}