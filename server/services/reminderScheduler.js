const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const { makeReminderCall } = require('../controllers/voiceController');

// Schedule reminder calls
const initReminderScheduler = () => {
    // Run every day at 8 AM to send reminders for today's appointments
    cron.schedule('0 8 * * *', async () => {
        console.log('🔔 Running daily appointment reminder calls...');
        await sendDailyReminders();
    });

    // Run every hour to send reminders for appointments in 1 hour
    cron.schedule('0 * * * *', async () => {
        console.log('🔔 Running hourly reminder check...');
        await sendHourlyReminders();
    });

    console.log('📅 Reminder scheduler initialized');
};

// Send reminders for all appointments today
const sendDailyReminders = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find all confirmed appointments for today that haven't been reminded
        const appointments = await Appointment.find({
            date: { $gte: today, $lt: tomorrow },
            status: 'confirmed',
            reminderSent: { $ne: true }
        }).populate('patientId').populate('doctorId');

        console.log(`Found ${appointments.length} appointments for today`);

        for (const appointment of appointments) {
            try {
                if (appointment.patientId?.phone) {
                    const result = await makeReminderCall(appointment._id);
                    if (result.success) {
                        await Appointment.findByIdAndUpdate(appointment._id, {
                            reminderSent: true,
                            reminderSentAt: new Date()
                        });
                        console.log(`✅ Reminder sent for appointment ${appointment._id}`);
                    } else {
                        console.log(`❌ Failed to send reminder for ${appointment._id}: ${result.error}`);
                    }

                    // Wait 5 seconds between calls to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } catch (error) {
                console.error(`Error sending reminder for ${appointment._id}:`, error);
            }
        }
    } catch (error) {
        console.error('Error in daily reminders:', error);
    }
};

// Send reminders for appointments in the next hour
const sendHourlyReminders = async () => {
    try {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        // Parse current time to compare with appointment times
        const currentHour = now.getHours();
        const targetHour = (currentHour + 1) % 24;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find appointments for today
        const appointments = await Appointment.find({
            date: { $gte: today, $lt: tomorrow },
            status: 'confirmed',
            hourlyReminderSent: { $ne: true }
        }).populate('patientId').populate('doctorId');

        // Filter appointments that are in ~1 hour
        const upcomingAppointments = appointments.filter(apt => {
            const timeMatch = apt.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (timeMatch) {
                let hour = parseInt(timeMatch[1]);
                const period = timeMatch[3].toUpperCase();

                if (period === 'PM' && hour !== 12) hour += 12;
                if (period === 'AM' && hour === 12) hour = 0;

                return hour === targetHour;
            }
            return false;
        });

        console.log(`Found ${upcomingAppointments.length} appointments in the next hour`);

        for (const appointment of upcomingAppointments) {
            try {
                if (appointment.patientId?.phone) {
                    const result = await makeReminderCall(appointment._id);
                    if (result.success) {
                        await Appointment.findByIdAndUpdate(appointment._id, {
                            hourlyReminderSent: true,
                            hourlyReminderSentAt: new Date()
                        });
                        console.log(`✅ Hourly reminder sent for appointment ${appointment._id}`);
                    }

                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } catch (error) {
                console.error(`Error sending hourly reminder for ${appointment._id}:`, error);
            }
        }
    } catch (error) {
        console.error('Error in hourly reminders:', error);
    }
};

// Manual trigger for testing
const triggerRemindersManually = async () => {
    console.log('🔔 Manually triggering reminders...');
    await sendDailyReminders();
};

module.exports = {
    initReminderScheduler,
    sendDailyReminders,
    sendHourlyReminders,
    triggerRemindersManually
};
