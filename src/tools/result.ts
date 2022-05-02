import { WrapperResult, WrapperResultLazyProps } from '.';

export function $_$(
  opcode: number,
  statusCode: number,
  message?: string,
  reportable?: boolean
): (props?: WrapperResultLazyProps) => WrapperResult {
  return (lazyOptions: WrapperResultLazyProps = {}) =>
    new WrapperResult({
      opcode,
      statusCode,
      message,
      reportable,
      ...lazyOptions,
    });
}

export const RESULT = {
  /** SAME ERRORS  */
  SUCCESS: $_$(0, 200),
  REQUIRED_ACCESS_KEY: $_$(401, 401, 'REQUIRED_ACCESS_KEY'),
  EXPIRED_ACCESS_KEY: $_$(402, 401, 'EXPIRED_ACCESS_KEY'),
  PERMISSION_DENIED: $_$(403, 403, 'PERMISSION_DENIED'),
  INVALID_ERROR: $_$(404, 500, 'INVALID_ERROR'),
  FAILED_VALIDATE: $_$(405, 400, 'FAILED_VALIDATE'),
  INVALID_API: $_$(406, 404, 'INVALID_API'),
  /** SERVICE ERROR */
  IMAGE_NOT_INCLUDED: $_$(407, 400, 'IMAGE_NOT_INCLUDED'),
};
