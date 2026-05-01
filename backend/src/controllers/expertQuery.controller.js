const ExpertQuery = require('../models/ExpertQuery');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Multer config for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/queries/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files allowed'), false);
        }
    }
});

exports.createQuery = async (req, res) => {
  console.log('--- [CONTROLLER] createQuery ---');
  console.log('Request Body fields:', Object.keys(req.body));
  console.log('Request File:', req.file ? {
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'MISSING');
  
  const { title, description, cropId, userId } = req.body;
  
  const queryData = {
    title: title || 'Untitled Query',
    description: description || 'No description provided',
    cropId: cropId || 'Unknown',
    userId: userId || req.user?.id
  };
  
  if (req.file) {
    queryData.imageUrl = `/uploads/queries/${req.file.filename}`;
    console.log('SUCCESS: Image URL assigned:', queryData.imageUrl);
  } else {
    console.log('INFO: No image file received, query will be created without imageUrl');
  }
  
  try {
    const query = new ExpertQuery(queryData);
    await query.save();
    console.log('SUCCESS: ExpertQuery saved to DB:', query._id);
    res.status(201).json({ success: true, data: query });
  } catch (err) {
    console.error('ERROR: Database save failed:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save query to database',
      error: err.message 
    });
  }
};

exports.getMyQueries = async (req, res) => {
  const queries = await ExpertQuery.find({ userId: req.user.id }).populate('cropId', 'name');
  res.json({ success: true, data: queries });
};

exports.getQueries = async (req, res) => {
  const queries = await ExpertQuery.find().populate('cropId', 'name').populate('userId', 'name');
  console.log('GET ALL QUERIES - Sample Query User:', queries[0]?.userId);
  res.json({ success: true, data: queries });
};

exports.getQueryById = async (req, res) => {
  const query = await ExpertQuery.findById(req.params.id).populate('cropId', 'name').populate('userId', 'name');
  if (!query) {
    return res.status(404).json({ success: false, message: 'Query not found' });
  }
  res.json({ success: true, data: query });
};

exports.updateQuery = async (req, res) => {
  try {
    const query = await ExpertQuery.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    const { title, description, reply, status } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (reply !== undefined) updates.reply = reply;
    if (status !== undefined) updates.status = status;

    if (req.file) {
      console.log('Updating image for query:', req.params.id);
      // Delete old image if exists
      if (query.imageUrl) {
        const filename = path.basename(query.imageUrl);
        if (filename) {
          const oldPath = path.join(__dirname, '../../../public/uploads/queries/', filename);
          try {
            await fs.unlink(oldPath).catch(() => {}); // Ignore error if file doesn't exist
            console.log('Deleted old image');
          } catch (unlinkErr) {
            console.warn('Could not delete old image');
          }
        }
      }
      updates.imageUrl = `/uploads/queries/${req.file.filename}`;
      console.log('New image assigned:', updates.imageUrl);
    } else if (req.body.removeImage === 'true') {
      console.log('Removing image for query:', req.params.id);
      if (query.imageUrl) {
        const filename = path.basename(query.imageUrl);
        if (filename) {
          const oldPath = path.join(__dirname, '../../../public/uploads/queries/', filename);
          await fs.unlink(oldPath).catch(() => {}); 
        }
        updates.imageUrl = '';
      }
    }

    const updated = await ExpertQuery.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('cropId', 'name').populate('userId', 'name');

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteQuery = async (req, res) => {
  await ExpertQuery.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted successfully" });
};

