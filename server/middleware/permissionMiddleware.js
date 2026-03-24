const RolePermission = require('../models/RolePermission');

/**
 * Middleware to check if the authenticated user has a specific permission.
 * Admin role natively bypasses this check.
 * 
 * @param {string} permissionKey The permission key to check against the DB.
 */
const requirePermission = (permissionKey) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            if (req.user.role === 'admin') {
                return next();
            }

            const roleRecord = await RolePermission.findOne({ role: req.user.role });

            // If no record exists or the permission is explicitly false/missing
            if (!roleRecord || !roleRecord.permissions || !roleRecord.permissions.get(permissionKey)) {
                return res.status(403).json({
                    message: 'Forbidden. You do not have permission to perform this action.'
                });
            }

            next();
        } catch (error) {
            console.error('Permission check failed:', error);
            res.status(500).json({ message: 'Internal Server Error during permission check' });
        }
    };
};

/**
 * Seeds initial permissions in the database if they don't already exist.
 * This is typically called when the server starts.
 */
const initializePermissions = async () => {
    try {
        const defaultPermissions = {
            lawyer: {
                case_create: true,
                case_edit: true,
                case_delete: false,
                hearing_create: true,
                document_upload: true,
                message_send: true,
                invoice_generate: true
            },
            client: {
                case_create: false,
                case_edit: false,
                case_delete: false,
                hearing_create: false,
                document_upload: true,
                message_send: true,
                invoice_generate: false
            }
        };

        for (const [roleName, perms] of Object.entries(defaultPermissions)) {
            const exists = await RolePermission.findOne({ role: roleName });
            if (!exists) {
                await RolePermission.create({
                    role: roleName,
                    permissions: perms
                });
                console.log(`Initialized default permissions for role: ${roleName}`);
            }
        }
    } catch (error) {
        console.error('Failed to initialize default permissions:', error);
    }
};

module.exports = { requirePermission, initializePermissions };
