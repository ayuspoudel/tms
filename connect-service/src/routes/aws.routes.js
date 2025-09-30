import express from "express";
import {
  connectAWS,
  listAWS,
  statusAWS,
  deleteAWS,
  getAWSBootstrapLink,
  getAWSBootstrapTemplateCtrl,
  getAWSBootstrapStatus,
    assumeAWSRole,
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

// Get CloudFormation Launch Stack link
router.get("/bootstrap/link", getAWSBootstrapLink);

// Get raw bootstrap template YAML
router.get("/bootstrap/template", getAWSBootstrapTemplateCtrl);

// Get bootstrap stack status (after tenant runs stack)
router.get("/:id/bootstrap/status", getAWSBootstrapStatus);

router.get("/:id/assume", assumeAWSRole);
export default router;
