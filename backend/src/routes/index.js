import { Router } from 'express';
import usersRouter from './users.js';
import restaurantsRouter from './restaurants.js';
import menuRouter from './menu.js';
import ordersRouter from './orders.js';
import analyticsRouter from './analytics.js';
import authRouter from './auth.js';
import deliveryRouter from './delivery.js';
import adminRouter from './admin.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/restaurants', restaurantsRouter);
router.use('/menu', menuRouter);
router.use('/orders', ordersRouter);
router.use('/analytics', analyticsRouter);
router.use('/delivery', deliveryRouter);
router.use('/admin', adminRouter);

export default router;
