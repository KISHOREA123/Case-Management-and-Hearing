const mongoose = require('mongoose');

const rolePermissionSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['lawyer', 'client'],
        unique: true
    },
    permissions: {
        type: Map,
        of: Boolean,
        default: {}
    }
});

module.exports = mongoose.model('RolePermission', rolePermissionSchema);
