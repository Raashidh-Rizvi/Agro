const Crop = require('../models/Crop');
const ExpertQuery = require('../models/ExpertQuery');
const AdvisoryAlert = require('../models/AdvisoryAlert');

/**
 * @desc    Get summary statistics for the dashboard and profile
 * @route   GET /api/stats/summary
 * @access  Private
 */
exports.getSummaryStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get counts in parallel for efficiency
        const [
            myCropsCount,
            myQueriesCount,
            totalAlertsCount,
            pendingQueriesCount,
            totalAnsweredCount
        ] = await Promise.all([
            Crop.countDocuments({ userId }),
            ExpertQuery.countDocuments({ userId }),
            AdvisoryAlert.countDocuments(),
            ExpertQuery.countDocuments({ status: { $regex: /pending/i } }),
            ExpertQuery.countDocuments({ reply: { $ne: "" } })
        ]);

        res.status(200).json({
            success: true,
            data: {
                crops: myCropsCount,
                queries: myQueriesCount,
                alerts: totalAlertsCount,
                pendingQueries: pendingQueriesCount,
                totalAnswers: totalAnsweredCount,
                activeAlerts: totalAlertsCount
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
};
