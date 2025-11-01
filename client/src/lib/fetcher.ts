
const getMessage = (message: any) => {
    // if message is an array, return the first element
    if (Array.isArray(message)) {
      if (typeof message[0] === 'object') return getMessage(message[0]);
      return message[0]?.toString();
    }
    // if message is an object, loop through the object until you find a string property
    if (typeof message === 'object') {
      for (const key in message) {
        if (typeof message[key] === 'string') return message[key]?.toString();
        if (typeof message[key] === 'object') return getMessage(message[key]);
      }
    }
    // if message is a string, return the message
    return message?.toString();
  };

/**
 * Extracts error message from API response
 */
export function getResError(error: any, defaultMessage: string = 'Unknown error occurred'): string {
    if (!error) return 'Unknown error occurred';
  
    // Handle axios error structure
    if (error.response) {
      const { data } = error.response;
  
      // Check common error message structures
      if (data?.error) return getMessage(data.error);
      if (data?.message) return getMessage(data.message);
      if (data?.error?.message) return getMessage(data.error.message);
      if (data?.error) return typeof data.error === 'string' ? data.error : 'An error occurred';
      if (data?.errors?.length) return getMessage(data.errors[0].message) || 'Validation error';
  
      return 'Server error';
    }
  
    // Handle string error
    if (typeof error === 'string') return error;
  
    // Handle Error object
    if (error instanceof Error) return error.message?.toString();
  
    return defaultMessage;
  }