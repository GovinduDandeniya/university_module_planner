const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const JsonStore = require('../config/db');
const auth = require('../middleware/auth');

const modules = new JsonStore('modules.json');
const assignments = new JsonStore('assignments.json');

// All routes are protected
router.use(auth);

// @route   GET /api/modules
// @desc    Get all modules for current user
// @access  Private
router.get('/', (req, res) => {
  try {
    const userModules = modules.findAll({ userId: req.user.id });
    res.json(userModules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/modules
// @desc    Create a new module
// @access  Private
router.post('/', (req, res) => {
  try {
    const { moduleName, moduleCode, semester, colorTag } = req.body;

    if (!moduleName || !moduleCode) {
      return res.status(400).json({ message: 'Module name and code are required' });
    }

    const newModule = {
      id: uuidv4(),
      moduleName,
      moduleCode,
      semester: semester || '',
      colorTag: colorTag || '#6366f1',
      userId: req.user.id,
      createdAt: new Date().toISOString()
    };

    modules.create(newModule);
    res.status(201).json(newModule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/modules/:id
// @desc    Update a module
// @access  Private
router.put('/:id', (req, res) => {
  try {
    const mod = modules.findById(req.params.id);
    if (!mod) {
      return res.status(404).json({ message: 'Module not found' });
    }
    if (mod.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { moduleName, moduleCode, semester, colorTag } = req.body;
    const updates = {};
    if (moduleName) updates.moduleName = moduleName;
    if (moduleCode) updates.moduleCode = moduleCode;
    if (semester !== undefined) updates.semester = semester;
    if (colorTag) updates.colorTag = colorTag;

    const updated = modules.updateById(req.params.id, updates);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/modules/:id
// @desc    Delete a module and its assignments
// @access  Private
router.delete('/:id', (req, res) => {
  try {
    const mod = modules.findById(req.params.id);
    if (!mod) {
      return res.status(404).json({ message: 'Module not found' });
    }
    if (mod.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all assignments for this module
    assignments.deleteMany({ moduleId: req.params.id });

    // Delete the module
    modules.deleteById(req.params.id);
    res.json({ message: 'Module and its assignments deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
