import { Router, type IRouter } from "express";
import healthRouter from "./health";
import catalogRouter from "./catalog";
import ordersRouter from "./orders";
import authRouter from "./auth";
import adminRouter from "./admin";
import "../lib/seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogRouter);
router.use(ordersRouter);
router.use(authRouter);
router.use(adminRouter);

export default router;
