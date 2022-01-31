import dayjs, { Dayjs } from 'dayjs';
import {
  getCoreServiceClient,
  logger,
  RESULT,
  Wrapper,
  WrapperCallback,
} from '..';

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

export type UserModel = HikickUserModel | MykickUserModel;

export function UserMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const { headers } = req;
    const { authorization } = headers;
    if (typeof authorization !== 'string') throw RESULT.INVALID_ERROR();
    const sessionId = authorization.substring(7);
    if (sessionId === 'mykick') {
      req.loggined = { user: { provider: 'mykick' } };
    } else {
      const { user } = await getCoreServiceClient('accounts')
        .post(`users/authorize`, { json: { sessionId } })
        .json();

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
