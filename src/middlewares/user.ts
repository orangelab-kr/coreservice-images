import dayjs, { Dayjs } from 'dayjs';
import { getCoreServiceClient, RESULT, Wrapper, WrapperCallback } from '..';

export interface HikickUserModel {
  provider: 'hikick';
  userId: string;
  realname: string;
  phoneNo: string;
  email?: string;
  birthday: Dayjs;
  usedAt: Dayjs;
  createdAt: Dayjs;
  updatedAt: Dayjs;
}

export interface MykickUserModel {
  provider: 'mykick';
}

export interface BackofficeUserModel {
  provider: 'backoffice';
}

export type UserModel = HikickUserModel | MykickUserModel | BackofficeUserModel;

export function UserMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const { headers } = req;
    const { authorization } = headers;
    if (typeof authorization !== 'string') throw RESULT.INVALID_ERROR();
    const sessionId = authorization.substring(7);
    if (sessionId === 'mykick') {
      req.loggined = { user: { provider: 'mykick' } };
    } else if (sessionId === 'backoffice') {
      req.loggined = { user: { provider: 'backoffice' } };
    } else {
      const { user } = await getCoreServiceClient('accounts')
        .post(`users/authorize`, { json: { sessionId } })
        .json<{ opcode: number; user: HikickUserModel }>();

      req.loggined = {
        sessionId: sessionId,
        user: {
          provider: 'hikick',
          userId: user.userId,
          realname: user.realname,
          phoneNo: user.phoneNo,
          email: user.email,
          birthday: dayjs(user.birthday),
          usedAt: dayjs(user.usedAt),
          createdAt: dayjs(user.createdAt),
          updatedAt: dayjs(user.updatedAt),
        },
      };
    }

    next();
  });
}
