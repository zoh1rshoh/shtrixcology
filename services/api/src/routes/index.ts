import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from './auth.js';
import { passportsRouter } from './passports.js';
import { teamsRouter } from './teams.js';
import { walletRouter } from './wallet.js';
import { collectionRouter } from './collection.js';
import { productsRouter } from './products.js';
import { scanRouter } from './scan.js';
import { battlesRouter } from './battles.js';
import { settingsRouter } from './settings.js';
import { providersRouter } from './providers.js';


export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/passports', passportsRouter);
apiRouter.use('/teams', teamsRouter);
apiRouter.use('/wallet', walletRouter);
apiRouter.use('/collection', collectionRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/scan', scanRouter);
apiRouter.use('/battles', battlesRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/providers', providersRouter);
