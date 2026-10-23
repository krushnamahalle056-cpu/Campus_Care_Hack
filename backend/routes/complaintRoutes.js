
import express from "express";
import mongoose from "mongoose";
import Complaint from "../models/Complaint.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

const validStatuses = ["Pending", "In Progress", "Resolved"];
const validPriorities = ["Low", "Medium", "High"];

// Student: create complaint
router.post("/", authenticate, async (req, res) => {
  try {
    const {
      title,
      category,
      department,
      location,
      description,
      priority,
    } = req.body;

    if (
      ![title, category, department, location, description].every(
        value => typeof value === "string" && value.trim()
      )
    ) {
      return res.status(400).json({
        message: "Please complete all required fields.",
      });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: "Invalid priority." });
    }

    const complaint = await Complaint.create({
      userId: req.user.id,
      title: title.trim(),
      category,
      department,
      location: location.trim(),
      description: description.trim(),
      priority: priority || "Medium",
    });

    return res.status(201).json({
      message: "Complaint submitted successfully.",
      complaint,
    });
  } catch (error) {
    console.error("Complaint creation error:", error.message);
    return res.status(500).json({
      message: "Could not submit complaint.",
    });
  }
});

// Student: get only their own complaints
router.get("/", authenticate, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    return res.json({ complaints });
  } catch {
    return res.status(500).json({
      message: "Could not load complaints.",
    });
  }
});

// Admin: get all complaints
router.get("/admin/all", authenticate, requireAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    return res.json({ complaints });
  } catch {
    return res.status(500).json({
      message: "Could not load complaints.",
    });
  }
});

// Admin: update complaint status
router.patch("/:id/status", authenticate, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid complaint ID." });
    }

    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid complaint status." });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    return res.json({
      message: "Complaint status updated.",
      complaint,
    });
  } catch {
    return res.status(500).json({
      message: "Could not update complaint.",
    });
  }
});

export default router;
