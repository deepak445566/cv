import express from "express";

import { updateCart } from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.post('/update', authUser, updateCart);

export default cartRouter;
