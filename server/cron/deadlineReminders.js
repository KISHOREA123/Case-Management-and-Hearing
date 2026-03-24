const cron = require('node-cron');
const CaseDeadline = require('../models/CaseDeadline');
const Notification = require('../models/Notification');

/**
 * Cron job that runs every day at midnight to:
 * 1. Mark overdue pending deadlines as "Missed"
 * 2. Create in-app notifications for deadlines due in 1 or 3 days
 */
const startDeadlineCron = () => {
    // Run at midnight every day
    cron.schedule('0 0 * * *', async () => {
        console.log('[Cron] Running deadline reminder check...');

        const now = new Date();
        try {
            // Mark overdue deadlines as Missed
            const overdueResult = await CaseDeadline.updateMany(
                { status: 'Pending', deadline_date: { $lt: now } },
                { status: 'Missed' }
            );
            if (overdueResult.modifiedCount > 0) {
                console.log(`[Cron] Marked ${overdueResult.modifiedCount} deadline(s) as Missed.`);
            }

            // Find deadlines due in 3 days
            const in3Days = new Date(now);
            in3Days.setDate(in3Days.getDate() + 3);
            const startOf3 = new Date(in3Days);
            startOf3.setHours(0, 0, 0, 0);
            const endOf3 = new Date(in3Days);
            endOf3.setHours(23, 59, 59, 999);

            const reminders3 = await CaseDeadline.find({
                status: 'Pending',
                deadline_date: { $gte: startOf3, $lte: endOf3 }
            }).populate({ path: 'case_id', select: 'case_number lawyer_id' });

            for (const d of reminders3) {
                if (d.case_id && d.case_id.lawyer_id) {
                    await Notification.create({
                        user_id: d.case_id.lawyer_id,
                        title: 'Deadline Reminder (3 days)',
                        message: `Deadline "${d.deadline_title}" for Case ${d.case_id.case_number} is due in 3 days.`,
                        link: `/cases/${d.case_id._id}`
                    });
                }
            }

            // Find deadlines due in 1 day
            const in1Day = new Date(now);
            in1Day.setDate(in1Day.getDate() + 1);
            const startOf1 = new Date(in1Day);
            startOf1.setHours(0, 0, 0, 0);
            const endOf1 = new Date(in1Day);
            endOf1.setHours(23, 59, 59, 999);

            const reminders1 = await CaseDeadline.find({
                status: 'Pending',
                deadline_date: { $gte: startOf1, $lte: endOf1 }
            }).populate({ path: 'case_id', select: 'case_number lawyer_id' });

            for (const d of reminders1) {
                if (d.case_id && d.case_id.lawyer_id) {
                    await Notification.create({
                        user_id: d.case_id.lawyer_id,
                        title: '⚠️ Deadline Reminder (Tomorrow)',
                        message: `Deadline "${d.deadline_title}" for Case ${d.case_id.case_number} is due TOMORROW!`,
                        link: `/cases/${d.case_id._id}`
                    });
                }
            }

            console.log('[Cron] Deadline check complete.');
        } catch (error) {
            console.error('[Cron] Deadline reminder error:', error);
        }
    });

    console.log('[Cron] Deadline reminder job scheduled.');
};

module.exports = { startDeadlineCron };
