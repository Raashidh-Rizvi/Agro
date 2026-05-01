const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');

const backendRoot = path.join(__dirname, '..');
const controllerPath = path.join(backendRoot, 'src', 'controllers', 'alert.controller.js');
const routePath = path.join(backendRoot, 'src', 'routes', 'alert.routes.js');
const modelPath = path.join(backendRoot, 'src', 'models', 'AdvisoryAlert.js');
const authPath = path.join(backendRoot, 'src', 'middleware', 'auth.middleware.js');

const loadWithMocks = (targetPath, mocks) => {
    delete require.cache[require.resolve(targetPath)];

    const originalLoad = Module._load;
    Module._load = function patchedLoad(request, parent, isMain) {
        const resolvedRequest = Module._resolveFilename(request, parent, isMain);
        if (Object.prototype.hasOwnProperty.call(mocks, resolvedRequest)) {
            return mocks[resolvedRequest];
        }
        return originalLoad.apply(this, arguments);
    };

    try {
        return require(targetPath);
    } finally {
        Module._load = originalLoad;
    }
};

const createResponse = () => ({
    statusCode: 200,
    body: null,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(payload) {
        this.body = payload;
        return this;
    }
});

test('updateAlert rejects requests without editable fields', async () => {
    const mockModel = {
        findById: async () => ({ createdBy: 'expert-1' }),
        findByIdAndUpdate: async () => {
            throw new Error('findByIdAndUpdate should not run when there are no editable fields');
        }
    };

    const { updateAlert } = loadWithMocks(controllerPath, {
        [modelPath]: mockModel
    });

    const req = {
        params: { id: 'alert-1' },
        body: { createdBy: 'malicious-user' },
        user: { id: 'expert-1', role: 'Expert' }
    };
    const res = createResponse();

    await updateAlert(req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, {
        success: false,
        message: 'No valid alert fields provided for update'
    });
});

test('createAlert stores only allowed fields and forces the authenticated owner', async () => {
    let capturedPayload = null;

    const mockModel = {
        create: async (payload) => {
            capturedPayload = payload;
            return { _id: 'alert-0' };
        },
        findById: () => ({
            populate() {
                return Promise.resolve({
                    _id: 'alert-0',
                    ...capturedPayload,
                    createdBy: { _id: 'expert-9', name: 'Expert User', role: 'Expert' }
                });
            }
        })
    };

    const { createAlert } = loadWithMocks(controllerPath, {
        [modelPath]: mockModel
    });

    const req = {
        body: {
            title: '  Paddy pest alert  ',
            cropType: ' Paddy ',
            district: ' Kurunegala ',
            season: ' Yala 2026 ',
            message: '  Watch for leaf damage in the next 48 hours.  ',
            alertType: 'weather',
            createdBy: 'malicious-user',
            unsupportedField: 'should-not-persist'
        },
        user: { id: 'expert-9', role: 'Expert' }
    };
    const res = createResponse();

    await createAlert(req, res, () => {});

    assert.deepEqual(capturedPayload, {
        title: 'Paddy pest alert',
        cropType: 'Paddy',
        district: 'Kurunegala',
        season: 'Yala 2026',
        message: 'Watch for leaf damage in the next 48 hours.',
        alertType: 'weather',
        createdBy: 'expert-9'
    });
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
});

test('updateAlert only applies editable fields for the alert owner', async () => {
    let capturedUpdate = null;
    let receivedPopulate = null;

    const mockModel = {
        findById: async () => ({ createdBy: 'expert-1' }),
        findByIdAndUpdate: (id, updates, options) => {
            capturedUpdate = { id, updates, options };
            return {
                populate(field, selection) {
                    receivedPopulate = { field, selection };
                    return Promise.resolve({
                        _id: id,
                        ...updates,
                        createdBy: { _id: 'expert-1', name: 'Expert User', role: 'Expert' }
                    });
                }
            };
        }
    };

    const { updateAlert } = loadWithMocks(controllerPath, {
        [modelPath]: mockModel
    });

    const req = {
        params: { id: 'alert-2' },
        body: {
            title: '  Irrigation reminder  ',
            district: ' Kurunegala ',
            createdBy: 'should-not-change'
        },
        user: { id: 'expert-1', role: 'Expert' }
    };
    const res = createResponse();

    await updateAlert(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.deepEqual(capturedUpdate, {
        id: 'alert-2',
        updates: {
            title: 'Irrigation reminder',
            district: 'Kurunegala'
        },
        options: {
            new: true,
            runValidators: true
        }
    });
    assert.deepEqual(receivedPopulate, {
        field: 'createdBy',
        selection: 'name role'
    });
    assert.equal(res.body.success, true);
    assert.equal(res.body.alert.title, 'Irrigation reminder');
});

test('getAlerts applies trimmed filters and limit for dashboard-friendly reads', async () => {
    let capturedFilters = null;
    let capturedLimit = null;
    let capturedPopulate = null;
    let capturedSort = null;

    const mockAlerts = [
        { _id: 'alert-a', title: 'Weather update' },
        { _id: 'alert-b', title: 'Pest watch' }
    ];

    const mockModel = {
        find: (filters) => {
            capturedFilters = filters;

            return {
                populate(field, selection) {
                    capturedPopulate = { field, selection };
                    return this;
                },
                sort(sortConfig) {
                    capturedSort = sortConfig;
                    return this;
                },
                limit(limitValue) {
                    capturedLimit = limitValue;
                    return Promise.resolve(mockAlerts);
                }
            };
        }
    };

    const { getAlerts } = loadWithMocks(controllerPath, {
        [modelPath]: mockModel
    });

    const req = {
        query: {
            cropType: ' Paddy ',
            district: ' Kurunegala ',
            season: ' Yala 2026 ',
            search: ' leaf damage ',
            limit: '2'
        }
    };
    const res = createResponse();

    await getAlerts(req, res, () => {});

    assert.equal(capturedFilters.cropType.test('Paddy'), true);
    assert.equal(capturedFilters.district.test('Kurunegala'), true);
    assert.equal(capturedFilters.season.test('Yala 2026'), true);
    assert.equal(capturedFilters.$or.length, 5);
    assert.deepEqual(capturedPopulate, { field: 'createdBy', selection: 'name role' });
    assert.deepEqual(capturedSort, { createdAt: -1 });
    assert.equal(capturedLimit, 2);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.count, 2);
});

test('deleteAlert allows admins to remove alerts they did not create', async () => {
    let deleted = false;

    const mockAlert = {
        createdBy: 'expert-1',
        async deleteOne() {
            deleted = true;
        }
    };

    const mockModel = {
        findById: async () => mockAlert
    };

    const { deleteAlert } = loadWithMocks(controllerPath, {
        [modelPath]: mockModel
    });

    const req = {
        params: { id: 'alert-3' },
        user: { id: 'admin-9', role: 'Admin' }
    };
    const res = createResponse();

    await deleteAlert(req, res, () => {});

    assert.equal(deleted, true);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, {
        success: true,
        message: 'Alert deleted successfully'
    });
});

test('alert routes require expert or admin authorization for create, update, and delete', () => {
    const authorizeCalls = [];

    const mockedController = {
        createAlert() {},
        getAlerts() {},
        getAlertById() {},
        updateAlert() {},
        deleteAlert() {}
    };

    const mockedAuth = {
        protect(req, res, next) {
            if (next) next();
        },
        authorize(...roles) {
            authorizeCalls.push(roles);
            const middleware = function authorizeRoles(req, res, next) {
                if (next) next();
            };
            return middleware;
        }
    };

    loadWithMocks(routePath, {
        [controllerPath]: mockedController,
        [authPath]: mockedAuth
    });

    assert.deepEqual(authorizeCalls, [
        ['Expert', 'Admin'],
        ['Expert', 'Admin'],
        ['Expert', 'Admin']
    ]);
});
