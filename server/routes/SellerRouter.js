import express from "express";

import {
  isSellerAuth,
  sellerLogin,
  Sellerlogout,
} from "../controllers/SellerController.js";
import authSeller from "../middlewares/authSeller.js";

const sellerRouter = express.Router();

sellerRouter.post("/login", sellerLogin);
sellerRouter.get("/isauth", authSeller, isSellerAuth);
sellerRouter.get("/logout", Sellerlogout);

export default sellerRouter;
