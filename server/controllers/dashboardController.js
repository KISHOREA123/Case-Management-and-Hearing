const { Case, Hearing, Client, User, Invoice, CaseTimeline, Notification } = require('../models');

// @desc    Get dashboard statistics based on user role
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user._id;

        if (role === 'admin') {
            const totalCases = await Case.countDocuments();
            const activeCases = await Case.countDocuments({ status: 'Active' });
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const totalHearings = await Hearing.countDocuments({ hearing_date: { $gte: startOfDay } });
            const totalClients = await Client.countDocuments();

            const recentCases = await Case.find()
                .populate('lawyer_id', 'name')
                .sort('-createdAt')
                .limit(5);

            const upcomingHearings = await Hearing.find({ hearing_date: { $gte: startOfDay } })
                .populate('case_id', 'case_title case_number')
                .sort('hearing_date hearing_time')
                .limit(3);

            const urgentCases = await Case.find({ priority: 'Urgent' })
                .populate('lawyer_id', 'name')
                .sort('-createdAt')
                .limit(5);

            // Only show timeline entries for cases that still exist
            const existingCaseIds = await Case.find().select('_id').lean();
            const existingIds = existingCaseIds.map(c => c._id);

            const recentActivity = await CaseTimeline.find({ case_id: { $in: existingIds } })
                .populate('case_id', 'case_title case_number')
                .populate('created_by', 'name')
                .sort('-created_at')
                .limit(10);

            const notificationsCount = await Notification.countDocuments({ user_id: userId, is_read: false });

            return res.json({
                stats: [
                    { title: 'Total Cases', value: totalCases.toString(), trend: 0, description: 'All time' },
                    { title: 'Active Cases', value: activeCases.toString(), trend: 0, description: 'Currently ongoing' },
                    { title: 'Upcoming Hearings', value: totalHearings.toString(), trend: 0, description: 'Scheduled' },
                    { title: 'Total Clients', value: totalClients.toString(), trend: 0, description: 'Registered' },
                ],
                recentCases,
                upcomingHearings,
                urgentCases,
                recentActivity,
                notificationsCount
            });
        }

        if (role === 'lawyer') {
            const myCases = await Case.countDocuments({ lawyer_id: userId });
            const myActiveCases = await Case.countDocuments({ lawyer_id: userId, status: 'Active' });

            // Get hearings for cases assigned to this lawyer
            const lawyerCaseIds = await Case.find({ lawyer_id: userId }).distinct('_id');
            const myUpcomingHearingsCount = await Hearing.countDocuments({
                case_id: { $in: lawyerCaseIds },
                date: { $gte: new Date() }
            });

            const myClients = await Client.countDocuments({ assigned_lawyer: userId });

            const recentCases = await Case.find({ lawyer_id: userId })
                .sort('-createdAt')
                .limit(5);

            const upcomingHearings = await Hearing.find({
                case_id: { $in: lawyerCaseIds },
                hearing_date: { $gte: new Date() }
            })
                .populate('case_id', 'case_title case_number')
                .sort('hearing_date hearing_time')
                .limit(3);

            const urgentCases = await Case.find({ lawyer_id: userId, priority: 'Urgent' })
                .sort('-createdAt')
                .limit(5);

            const recentActivity = await CaseTimeline.find({ case_id: { $in: lawyerCaseIds } })
                .populate('case_id', 'case_title case_number')
                .populate('created_by', 'name')
                .sort('-created_at')
                .limit(10);

            const notificationsCount = await Notification.countDocuments({ user_id: userId, is_read: false });

            return res.json({
                stats: [
                    { title: 'My Cases', value: myCases.toString(), description: 'Assigned to me' },
                    { title: 'Active Cases', value: myActiveCases.toString(), description: 'In progress' },
                    { title: 'My Hearings', value: myUpcomingHearingsCount.toString(), description: 'Upcoming sessions' },
                    { title: 'My Clients', value: myClients.toString(), description: 'Active relationships' },
                ],
                recentCases,
                upcomingHearings,
                urgentCases,
                recentActivity,
                notificationsCount
            });
        }

        if (role === 'client') {
            const client = await Client.findOne({ user_id: userId }).populate({
                path: 'related_case_id',
                populate: { path: 'hearings' }
            });

            if (!client || !client.related_case_id) {
                return res.json({
                    stats: [
                        { title: 'Active Cases', value: '0' },
                        { title: 'Next Hearing', value: 'None' },
                        { title: 'Case Status', value: 'N/A' },
                        { title: 'Pending Invoices', value: '0' },
                    ],
                    timeline: [],
                    documents: []
                });
            }

            const myCase = client.related_case_id;
            const nextHearing = await Hearing.findOne({
                case_id: myCase._id,
                date: { $gte: new Date() }
            }).sort('date');

            const pendingInvoices = await Invoice.countDocuments({
                client_id: client._id,
                status: 'Unpaid'
            });

            const timelineEntries = await CaseTimeline.find({ case_id: myCase._id }).sort('created_at');

            return res.json({
                stats: [
                    { title: 'Active Cases', value: '1', icon: 'Briefcase' },
                    { title: 'Next Hearing', value: nextHearing ? nextHearing.hearing_date.toLocaleDateString() : 'TBD', description: nextHearing ? nextHearing.title : '' },
                    { title: 'Case Status', value: myCase.status || 'Active', description: 'Real-time update' },
                    { title: 'Pending Invoices', value: pendingInvoices.toString(), description: 'Check billing' },
                ],
                timeline: timelineEntries.map(t => ({
                    title: t.event_type,
                    description: t.description,
                    date: t.created_at.toLocaleDateString(),
                    done: true,
                    active: false
                })),
                documents: []
            });
        }

        res.status(400).json({ message: 'Invalid role' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardData };
