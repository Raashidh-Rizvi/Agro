const mongoose = require('mongoose');

const SL_DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Mullaitivu', 'Vavuniya', 'Trincomalee', 'Batticaloa', 'Ampara',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
];

const cropSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    cropName: {
        type: String,
        required: [true, 'Crop name is required'],
        trim: true
    },
    cropType: {
        type: String,
        trim: true
    },
    plantedDate: {
        type: Date,
        required: [true, 'Planted date is required']
    },
    cropDuration: {
        type: Number,
        required: [true, 'Crop duration is required'],
        min: [1, 'Crop duration must be greater than 0']
    },
    landSize: {
        type: Number,
        required: [true, 'Land size is required'],
        min: [0.01, 'Land size must be greater than 0']
    },
    district: {
        type: String,
        required: [true, 'District is required'],
        enum: { values: SL_DISTRICTS, message: 'Invalid district' }
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    }
}, { timestamps: true });

module.exports = mongoose.model('Crop', cropSchema);
module.exports.SL_DISTRICTS = SL_DISTRICTS;
