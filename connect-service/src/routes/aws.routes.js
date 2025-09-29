// src/routes/aws.routes.js

import express from "express";
import {
  connectAWS,
  listAWS,
  statusAWS,
  deleteAWS,
} from "../controllers/aws.controller.js";

const router = express.Router();

// Create new AWS integration
router.post("/connect", connectAWS);

// List all AWS integrations for a tenant
router.get("/", listAWS);

// Get status of a specific integration
router.get("/:id/status", statusAWS);

// Delete a specific integration
router.delete("/:id", deleteAWS);

export default router;
