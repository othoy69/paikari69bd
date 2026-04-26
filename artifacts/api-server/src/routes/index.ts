import { Router, type IRouter } from "express";
import healthRouter from "./health";
import catalogRouter from "./catalog";
import ordersRouter from "./orders";
import authRouter from "./auth";
import adminRouter from "./admin";
import adminPlusRouter from "./adminPlus";
import "../lib/seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogRouter);
router.use(ordersRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(adminPlusRouter);

export default router;
