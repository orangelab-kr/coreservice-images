import express from 'express';
import {
  logger,
  getRouter,
  InternalError,
  LoggerMiddleware,
  OPCODE,
  Wrapper,
} from '.';
import cors from 'cors';

export * from './middlewares';
export * from './controllers';
export * from './routes';
export * from './tools';

async function main() {
  logger.info('[System] 시스템을 활성화하고 있습니다.');
  const app = express();

  app.use(cors());
  app.use(express.json({}));
  app.use(express.urlencoded({ extended: true }));
  app.use(LoggerMiddleware());
  app.use('/v1/images', getRouter());
  app.all(
    '*',
    Wrapper(async () => {
      throw new InternalError('Invalid API', OPCODE.ERROR);
    })
  );

  app.listen(process.env.WEB_PORT, () => {
    logger.info('[System] 시스템이 준비되었습니다.');
  });
}

main();
