import { Router } from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { sendMessage, getMessage } from "../controllers/messageController.js";

const router = Router();

router.post("/send/:id", isAuthenticated, sendMessage );
router.get("/all/:id", isAuthenticated, getMessage);

export default router;