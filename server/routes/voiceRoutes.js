const express = require('express');
const router = express.Router();
const {
    handleIncomingCall,
    handleLanguageSelection,
    handleBookAppointment,
    handleDoctorName,
    handleDateSelection,
    handleTimeSelection,
    handleAlternativeSlot,
    handleNoSlots,
    makeReminderCall,
    handleReminderWebhook,
    handleReminderResponse,
    getDebugData,
    initializeOutboundSession
} = require('../controllers/voiceController');

// Debug route (Public for easy verification)
router.get('/debug', getDebugData);

// Twilio webhooks (all POST requests from Twilio)
router.post('/incoming', handleIncomingCall);
router.post('/language-selected', handleLanguageSelection);
router.post('/book-appointment', handleBookAppointment);
router.post('/doctor-name', handleDoctorName);
router.post('/date-selection', handleDateSelection);
router.post('/time-selection', handleTimeSelection);
router.post('/alternative-slot', handleAlternativeSlot);
router.post('/no-slots', handleNoSlots);

// Reminder call routes
router.post('/reminder-webhook', handleReminderWebhook);
router.post('/reminder-response', handleReminderResponse);

// Internal API to trigger reminder calls
router.post('/trigger-reminder/:appointmentId', async (req, res) => {
    try {
        const result = await makeReminderCall(req.params.appointmentId);
        if (result.success) {
            res.json({ success: true, callSid: result.callSid });
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Initiate outbound call to patient for appointment booking
router.post('/initiate-call', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    const twilio = require('twilio');
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    // Debug: Log credentials (masked)
    console.log('Twilio Config:', {
        accountSid: accountSid ? accountSid.substring(0, 10) + '...' : 'NOT SET',
        authToken: authToken ? authToken.substring(0, 5) + '...' : 'NOT SET',
        phoneNumber: twilioPhoneNumber || 'NOT SET'
    });

    if (!accountSid || !authToken) {
        return res.status(500).json({
            success: false,
            error: 'Twilio credentials not configured. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env'
        });
    }

    try {
        const client = twilio(accountSid, authToken);

        // Format phone number (add +91 if not present)
        let formattedNumber = phoneNumber.replace(/\s/g, '').replace(/-/g, '');
        if (!formattedNumber.startsWith('+')) {
            if (formattedNumber.startsWith('91')) {
                formattedNumber = '+' + formattedNumber;
            } else {
                formattedNumber = '+91' + formattedNumber;
            }
        }

        console.log('Initiating call to:', formattedNumber);

        // TwiML Bin URLs (complete booking flow)
        const WELCOME_TWIML_URL = 'https://handler.twilio.com/twiml/EHfd1d7b1a6ac46e7356a807fb8f3ad7ed';
        const ENGLISH_TWIML_URL = 'https://handler.twilio.com/twiml/EH5ffb9c4274c1f8e07cb152f084dcff62';
        const HINDI_TWIML_URL = 'https://handler.twilio.com/twiml/EH445ad6482e37881997fb4ba6f2bf46b0';
        const ENGLISH_BOOK_URL = 'https://handler.twilio.com/twiml/EH186911511e1e391be0c959b041b51065';
        const HINDI_BOOK_URL = 'https://handler.twilio.com/twiml/EHe833d68b843a622932716a2075d5a0b9';

        // Check if we have a valid public URL (Render or Localtunnel)
        // We trust Render (.onrender.com) and Localtunnel (.loca.lt) to handle webhooks
        const isProduction = process.env.BASE_URL && (
            !process.env.BASE_URL.includes('localhost') ||
            process.env.BASE_URL.includes('loca.lt')
        );

        let twiml;
        if (isProduction) {
            // Use server webhooks for full functionality with database
            twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather numDigits="1" action="${process.env.BASE_URL}/api/voice/language-selected" method="POST" timeout="10">
        <Say voice="Polly.Aditi" language="hi-IN">Welcome to CareSync Healthcare.</Say>
        <Pause length="1"/>
        <Say voice="Polly.Joanna" language="en-US">Press 1 for English.</Say>
        <Say voice="Polly.Aditi" language="hi-IN">Hindi ke liye 2 dabayein.</Say>
    </Gather>
    <Say voice="Polly.Aditi" language="hi-IN">Sorry, I did not receive any input. Goodbye.</Say>
</Response>`;
            console.log('Using production webhooks:', process.env.BASE_URL);
        } else {
            // Use TwiML Bins for local/ngrok testing - redirect to Welcome TwiML Bin
            twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Redirect>${WELCOME_TWIML_URL}</Redirect>
</Response>`;
            console.log('Using TwiML Bins for local testing');
        }

        const call = await client.calls.create({
            twiml: twiml,
            to: formattedNumber,
            from: twilioPhoneNumber
        });

        console.log('Call initiated successfully:', call.sid);

        // INITIALIZE SESSION FOR OUTBOUND CALL
        // This ensures handleLanguageSelection finds the session
        await initializeOutboundSession(call.sid, formattedNumber);

        res.json({
            success: true,
            callSid: call.sid,
            message: `Call initiated to ${formattedNumber}`
        });
    } catch (error) {
        console.error('Error initiating call:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
