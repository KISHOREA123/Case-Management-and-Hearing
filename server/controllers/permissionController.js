const RolePermission = require('../models/RolePermission');

// @desc    Get all role permissions
// @route   GET /api/permissions
// @access  Private (Admin)
const getPermissions = async (req, res) => {
    try {
        const permissions = await RolePermission.find();
        res.json(permissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a role's specific permission
// @route   PUT /api/permissions
// @access  Private (Admin)
const updatePermission = async (req, res) => {
    try {
        const { role, permission_key, allowed } = req.body;

        const roleRecord = await RolePermission.findOne({ role });

        if (!roleRecord) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Initialize permissions map if extremely empty
        if (!roleRecord.permissions) {
            roleRecord.permissions = new Map();
        }

        const oldValue = !!roleRecord.permissions.get(permission_key);
        roleRecord.permissions.set(permission_key, allowed);
        await roleRecord.save();

        res.json(roleRecord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my permissions (For the current user context)
// @route   GET /api/permissions/me
// @access  Private
const getMyPermissions = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            return res.json({ isAdmin: true, permissions: {} });
        }

        const roleRecord = await RolePermission.findOne({ role: req.user.role });

        const permsObj = roleRecord && roleRecord.permissions
            ? Object.fromEntries(roleRecord.permissions)
            : {};

        res.json({ isAdmin: false, permissions: permsObj });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPermissions, updatePermission, getMyPermissions };
