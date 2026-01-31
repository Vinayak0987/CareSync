const nodemailer = require('nodemailer');

// Check if email credentials are configured
const isEmailConfigured = () => {
  return process.env.EMAIL_USER &&
    process.env.EMAIL_PASSWORD &&
    process.env.EMAIL_USER !== 'your-email@gmail.com' &&
    process.env.EMAIL_PASSWORD !== 'your-app-password-here';
};

// Create reusable transporter only if configured
let transporter = null;

if (isEmailConfigured()) {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log('✉️  Email service configured successfully');
  } catch (error) {
    console.error('❌ Email service configuration failed:', error.message);
  }
} else {
  console.log('⚠️  Email service not configured - emails will not be sent');
  console.log('   To enable emails, update EMAIL_USER and EMAIL_PASSWORD in .env');
}

// Send appointment booking email
const sendAppointmentBookingEmail = async (patientEmail, doctorEmail, appointmentDetails) => {
  // Skip if email not configured
  if (!transporter) {
    console.log('📧 Email not sent (service not configured)');
    return;
  }

  const { patientName, doctorName, date, time, reason } = appointmentDetails;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Email to Patient
  const patientMailOptions = {
    from: process.env.EMAIL_USER,
    to: patientEmail,
    subject: '✅ Appointment Confirmed - CareConnect Health',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #0D9488; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎉 Appointment Confirmed!</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Hi <strong>${patientName}</strong>,</p>
          
          <p style="font-size: 14px; color: #666;">Your appointment has been successfully booked.</p>
          
          <div style="background-color: #f0fdfa; border-left: 4px solid #0D9488; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #0D9488;">📅 Appointment Details</h3>
            <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          
          <p style="font-size: 14px; color: #666;">Please arrive 10 minutes early for your appointment.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}/dashboard" 
               style="background-color: #0D9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Dashboard
            </a>
          </div>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            CareConnect Health Platform<br/>
            Your health, our priority
          </p>
        </div>
      </div>
    `,
  };

  // Email to Doctor
  const doctorMailOptions = {
    from: process.env.EMAIL_USER,
    to: doctorEmail,
    subject: '📋 New Appointment Scheduled - CareConnect Health',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #0D9488; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">📋 New Appointment</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Hi <strong>Dr. ${doctorName}</strong>,</p>
          
          <p style="font-size: 14px; color: #666;">A new appointment has been scheduled with you.</p>
          
          <div style="background-color: #f0fdfa; border-left: 4px solid #0D9488; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #0D9488;">👤 Patient Information</h3>
            <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientName}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}/doctor/dashboard" 
               style="background-color: #0D9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Appointments
            </a>
          </div>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            CareConnect Health Platform<br/>
            Healthcare management made easy
          </p>
        </div>
      </div>
    `,
  };

  try {
    await Promise.all([
      transporter.sendMail(patientMailOptions),
      transporter.sendMail(doctorMailOptions)
    ]);
    console.log('✅ Appointment booking emails sent successfully');
  } catch (error) {
    console.error('❌ Error sending booking emails:', error.message);
    // Don't throw error - email failure shouldn't prevent appointment booking
  }
};

// Send appointment cancellation email
const sendAppointmentCancellationEmail = async (patientEmail, doctorEmail, appointmentDetails) => {
  // Skip if email not configured
  if (!transporter) {
    console.log('📧 Email not sent (service not configured)');
    return;
  }

  const { patientName, doctorName, date, time, cancelledBy } = appointmentDetails;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Email to Patient  
  const patientMailOptions = {
    from: process.env.EMAIL_USER,
    to: patientEmail,
    subject: '❌ Appointment Cancelled - CareConnect Health',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #EF4444; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">❌ Appointment Cancelled</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Hi <strong>${patientName}</strong>,</p>
          
          <p style="font-size: 14px; color: #666;">Your appointment has been cancelled.</p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #EF4444; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #EF4444;">📅 Cancelled Appointment</h3>
            <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
          </div>
          
          <p style="font-size: 14px; color: #666;">You can book a new appointment anytime from your dashboard.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}/appointments" 
               style="background-color: #0D9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Book New Appointment
            </a>
          </div>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            CareConnect Health Platform
          </p>
        </div>
      </div>
    `,
  };

  // Email to Doctor
  const doctorMailOptions = {
    from: process.env.EMAIL_USER,
    to: doctorEmail,
    subject: '❌ Appointment Cancelled - CareConnect Health',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #EF4444; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">❌ Appointment Cancelled</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Hi <strong>Dr. ${doctorName}</strong>,</p>
          
          <p style="font-size: 14px; color: #666;">An appointment has been cancelled.</p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #EF4444; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #EF4444;">👤 Cancelled Appointment</h3>
            <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientName}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 5px 0;"><strong>Cancelled by:</strong> ${cancelledBy}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}/doctor/dashboard" 
               style="background-color: #0D9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Schedule
            </a>
          </div>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            CareConnect Health Platform
          </p>
        </div>
      </div>
    `,
  };

  try {
    await Promise.all([
      transporter.sendMail(patientMailOptions),
      transporter.sendMail(doctorMailOptions)
    ]);
    console.log('✅ Appointment cancellation emails sent successfully');
  } catch (error) {
    console.error('❌ Error sending cancellation emails:', error.message);
    // Don't throw error - email failure shouldn't prevent cancellation
  }
};

module.exports = {
  sendAppointmentBookingEmail,
  sendAppointmentCancellationEmail,
};
