const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const JsonStore = require('../config/db');
const auth = require('../middleware/auth');

const assignments = new JsonStore('assignments.json');
const modules = new JsonStore('modules.json');

// All routes are protected
router.use(auth);

// @route   GET /api/assignments
// @desc    Get all assignments for current user (with optional filters)
// @access  Private
router.get('/', (req, res) => {
  try {
    let userAssignments = assignments.findAll({ userId: req.user.id });

    // Filter by module
    if (req.query.module) {
      userAssignments = userAssignments.filter(a => a.moduleId === req.query.module);
    }

    // Filter by status
    if (req.query.status) {
      userAssignments = userAssignments.filter(a => a.status === req.query.status);
    }

    // Attach module info to each assignment
    const enriched = userAssignments.map(a => {
      const mod = modules.findById(a.moduleId);
      return {
        ...a,
        moduleName: mod ? mod.moduleName : 'Unknown',
        moduleCode: mod ? mod.moduleCode : '',
        moduleColor: mod ? mod.colorTag : '#6366f1'
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments
// @desc    Create a new assignment
// @access  Private
router.post('/', (req, res) => {
  try {
    const { title, description, deadline, status, moduleId } = req.body;

    if (!title || !deadline || !moduleId) {
      return res.status(400).json({ message: 'Title, deadline, and module are required' });
    }

    // Verify module belongs to user
    const mod = modules.findById(moduleId);
    if (!mod || mod.userId !== req.user.id) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const newAssignment = {
      id: uuidv4(),
      title,
      description: description || '',
      deadline,
      status: status || 'Pending',
      moduleId,
      userId: req.user.id,
      createdAt: new Date().toISOString()
    };

    assignments.create(newAssignment);

    // Return enriched
    res.status(201).json({
      ...newAssignment,
      moduleName: mod.moduleName,
      moduleCode: mod.moduleCode,
      moduleColor: mod.colorTag
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update an assignment
// @access  Private
router.put('/:id', (req, res) => {
  try {
    const assignment = assignments.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    if (assignment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, deadline, status, moduleId } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (deadline) updates.deadline = deadline;
    if (status) updates.status = status;
    if (moduleId) {
      // Verify new module belongs to user
      const mod = modules.findById(moduleId);
      if (!mod || mod.userId !== req.user.id) {
        return res.status(404).json({ message: 'Module not found' });
      }
      updates.moduleId = moduleId;
    }

    const updated = assignments.updateById(req.params.id, updates);

    // Return enriched
    const mod = modules.findById(updated.moduleId);
    res.json({
      ...updated,
      moduleName: mod ? mod.moduleName : 'Unknown',
      moduleCode: mod ? mod.moduleCode : '',
      moduleColor: mod ? mod.colorTag : '#6366f1'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete an assignment
// @access  Private
router.delete('/:id', (req, res) => {
  try {
    const assignment = assignments.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    if (assignment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    assignments.deleteById(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
