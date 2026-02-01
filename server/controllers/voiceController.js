const twilio = require('twilio');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client;
try {
    if (accountSid && authToken && accountSid !== 'your_account_sid_here') {
        client = twilio(accountSid, authToken);
    }
} catch (error) {
    console.log('Twilio not configured yet');
}

// Voice messages in English and Hindi
const messages = {
    en: {
        welcome: 'Welcome to CareSync Healthcare. Press 1 for English. Press 2 for Hindi.',
        bookAppointment: 'Would you like to book an appointment? Press 1 for Yes. Press 2 for No.',
        askDoctorName: 'Please say the doctor name. For testing, you can also press 1 for vinayak or press 2 for Alok .',
        askDate: 'Please say your preferred date. Or press 1 for today, 2 for tomorrow.',
        askTime: 'Please say your preferred time. Or press 1 for 10 AM, 2 for 4 PM.',
        checkingAvailability: 'Please wait while I check the availability.',
        appointmentConfirmed: 'Great news! Your appointment has been confirmed with Doctor {doctorName} on {date} at {time}. You will receive a confirmation SMS shortly.',
        slotNotAvailable: 'Sorry, that slot is not available. Would you like another slot at {alternativeTime}? Press 1 for Yes. Press 2 for No.',
        noSlotsAvailable: 'Sorry, no slots are available for that date. Would you like to try another date? Press 1 for Yes. Press 2 to end the call.',
        thankYou: 'Thank you for using CareSync Healthcare. Have a great day!',
        notLoggedIn: 'Sorry, you need to be registered in our system to book an appointment. Please visit our website to register.',
        invalidInput: 'Sorry, I did not understand. Please try again.',
        reminder: 'Hello {patientName}. This is a reminder from CareSync Healthcare. You have an appointment with Doctor {doctorName} on {date} at {time}. Press 1 to confirm your appointment. Press 2 to reschedule.',
        confirmReminder: 'Thank you for confirming. We look forward to seeing you!',
        rescheduleInfo: 'Please visit our website or call again to reschedule your appointment.'
    },
    hi: {
        welcome: 'CareSync Healthcare में आपका स्वागत है। अंग्रेजी के लिए 1 दबाएं। हिंदी के लिए 2 दबाएं।',
        bookAppointment: 'क्या आप अपॉइंटमेंट बुक करना चाहते हैं? हाँ के लिए 1 दबाएं। नहीं के लिए 2 दबाएं।',
        askDoctorName: 'कृपया उस डॉक्टर का नाम बताएं जिनसे आप मिलना चाहते हैं।',
        askDate: 'कृपया अपनी पसंदीदा तारीख बताएं। जैसे, 5 फरवरी।',
        askTime: 'कृपया अपना पसंदीदा समय बताएं। जैसे, सुबह 10 बजे या दोपहर 3 बजे।',
        checkingAvailability: 'कृपया प्रतीक्षा करें, मैं उपलब्धता जांच रहा हूं।',
        appointmentConfirmed: 'बधाई हो! आपकी अपॉइंटमेंट डॉक्टर {doctorName} के साथ {date} को {time} पर कन्फर्म हो गई है। आपको जल्द ही SMS मिल जाएगा।',
        slotNotAvailable: 'माफ़ कीजिए, वह स्लॉट उपलब्ध नहीं है। क्या आप {alternativeTime} का स्लॉट लेना चाहेंगे? हाँ के लिए 1 दबाएं। नहीं के लिए 2 दबाएं।',
        noSlotsAvailable: 'माफ़ कीजिए, उस तारीख के लिए कोई स्लॉट उपलब्ध नहीं है। क्या आप दूसरी तारीख आज़माना चाहेंगे? हाँ के लिए 1 दबाएं। कॉल समाप्त करने के लिए 2 दबाएं।',
        thankYou: 'CareSync Healthcare का उपयोग करने के लिए धन्यवाद। आपका दिन शुभ हो!',
        notLoggedIn: 'माफ़ कीजिए, अपॉइंटमेंट बुक करने के लिए आपको हमारे सिस्टम में पंजीकृत होना आवश्यक है। कृपया रजिस्टर करने के लिए हमारी वेबसाइट पर जाएं।',
        invalidInput: 'माफ़ कीजिए, मैं समझ नहीं पाया। कृपया दोबारा कोशिश करें।',
        reminder: 'नमस्ते {patientName}। यह CareSync Healthcare से एक रिमाइंडर है। आपकी डॉक्टर {doctorName} के साथ {date} को {time} पर अपॉइंटमेंट है। कन्फर्म करने के लिए 1 दबाएं। रीशेड्यूल करने के लिए 2 दबाएं।',
        confirmReminder: 'पुष्टि करने के लिए धन्यवाद। हम आपसे मिलने के लिए उत्सुक हैं!',
        rescheduleInfo: 'अपनी अपॉइंटमेंट रीशेड्यूल करने के लिए कृपया हमारी वेबसाइट पर जाएं या फिर से कॉल करें।'
    }
};

// Store session data for ongoing calls
const callSessions = new Map();

// @desc    Initialize session for outbound call
const initializeOutboundSession = async (callSid, phoneNumber) => {
    // Check if user is registered
    const strippedPhone = phoneNumber.replace('+91', '').replace(/\D/g, ''); // Ensure clean number
    let user = await User.findOne({ phone: strippedPhone });

    if (!user) {
        // Auto-register logic for outbound too
        try {
            user = await User.create({
                name: 'Guest Outbound',
                email: `guest_out_${strippedPhone}_${Date.now()}@temp.com`,
                phone: strippedPhone,
                password: 'guest_password',
                role: 'patient'
            });
            console.log(`[Auto-Register Outbound] Created guest: ${user._id}`);
        } catch (e) {
            console.error('Error creating guest for outbound:', e);
            user = { _id: 'mock_outbound_id', name: 'Guest' };
        }
    }

    callSessions.set(callSid, {
        language: null, // Will be set in language-selected
        step: 'language_selection',
        userId: user ? user._id : null,
        userPhone: phoneNumber,
        doctorName: null,
        date: null,
        time: null,
        isRegistered: !!user
    });
    console.log(`[Session Init] Initialized outbound session for ${callSid} (${phoneNumber})`);
};

// @desc    Handle incoming call - Initial welcome
// @route   POST /api/voice/incoming
// @access  Public (Twilio webhook)
const handleIncomingCall = async (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const callSid = req.body.CallSid;
    const callerNumber = req.body.From;

    // Check if user is registered
    // Check if user is registered, if not, auto-register for testing
    let user = await User.findOne({ phone: callerNumber.replace('+91', '') });

    if (!user) {
        try {
            const strippedPhone = callerNumber.replace('+91', '') || '9999999999';
            // Auto-register guest
            user = await User.create({
                name: 'Guest Caller',
                email: `guest_${strippedPhone}_${Date.now()}@temp.com`, // Ensure uniqueness
                phone: strippedPhone,
                password: 'guest_password_123',
                role: 'patient'
            });
            console.log(`[Auto-Register] Created guest user: ${user._id}`);
        } catch (err) {
            console.error('[Auto-Register Error]', err);
            // Fallback mock if create fails (though DB needs real ID)
            user = { _id: '65bf7a1b9c9d4b001c9d4b00', name: 'Guest', language: 'en' };
        }
    }

    // Initialize session
    callSessions.set(callSid, {
        language: null,
        step: 'language_selection',
        userId: user ? user._id : null,
        userPhone: callerNumber,
        doctorName: null,
        date: null,
        time: null,
        isRegistered: !!user
    });

    // Welcome message with language selection
    const gather = twiml.gather({
        numDigits: 1,
        action: `${process.env.BASE_URL}/api/voice/language-selected`,
        method: 'POST',
        timeout: 10
    });

    gather.say({
        voice: 'Polly.Aditi',
        language: 'hi-IN'
    }, messages.hi.welcome);

    // If no input, repeat
    twiml.redirect(`${process.env.BASE_URL}/api/voice/incoming`);

    res.type('text/xml');
    res.send(twiml.toString());
};

// @desc    Handle language selection
// @route   POST /api/voice/language-selected
// @access  Public (Twilio webhook)
const handleLanguageSelection = async (req, res) => {
    try {
        const twiml = new twilio.twiml.VoiceResponse();
        const callSid = req.body.CallSid;
        const digit = req.body.Digits;

        console.log(`[Language Select] CallSid: ${callSid}, Digit: ${digit}`);

        const session = callSessions.get(callSid) || {};

        if (digit === '1') {
            session.language = 'en';
        } else if (digit === '2') {
            session.language = 'hi';
        } else {
            // Invalid input
            twiml.say(messages.hi.invalidInput);
            twiml.redirect(`${process.env.BASE_URL}/api/voice/incoming`);
            res.type('text/xml');
            return res.send(twiml.toString());
        }

        callSessions.set(callSid, session);
        const lang = session.language;
        const msg = messages[lang];

        // Check registration
        if (!session.isRegistered) {
            console.log(`[Auth Fail] User not registered. Phone: ${session.userPhone}`);
            twiml.say({
                voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                language: lang === 'en' ? 'en-US' : 'hi-IN'
            }, msg.notLoggedIn);
            // Ensure thankYou is spoken before hangup
            twiml.pause({ length: 1 });
            twiml.say({
                voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                language: lang === 'en' ? 'en-US' : 'hi-IN'
            }, msg.thankYou);
            twiml.hangup();
            res.type('text/xml');
            return res.send(twiml.toString());
        }

        // Ask to book
        const gather = twiml.gather({
            numDigits: 1,
            action: `${process.env.BASE_URL}/api/voice/book-appointment`,
            method: 'POST',
            timeout: 10
        });

        gather.say({
            voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
            language: lang === 'en' ? 'en-US' : 'hi-IN'
        }, msg.bookAppointment);

        twiml.redirect(`${process.env.BASE_URL}/api/voice/language-selected`);

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        console.error('[Language Select Error]', error);
        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say('Sorry, an application error occurred.');
        res.type('text/xml');
        res.send(twiml.toString());
    }
};

// @desc    Handle book appointment selection
// @route   POST /api/voice/book-appointment
// @access  Public (Twilio webhook)
// @desc    Handle book appointment selection
// @route   POST /api/voice/book-appointment
// @access  Public (Twilio webhook)
const handleBookAppointment = async (req, res) => {
    try {
        const twiml = new twilio.twiml.VoiceResponse();
        const callSid = req.body.CallSid;
        const digit = req.body.Digits;

        const session = callSessions.get(callSid) || {};
        const lang = session.language || 'en';
        const msg = messages[lang];

        if (digit === '2') {
            // User doesn't want to book
            twiml.say({
                voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                language: lang === 'en' ? 'en-US' : 'hi-IN'
            }, msg.thankYou);
            twiml.hangup();
            res.type('text/xml');
            return res.send(twiml.toString());
        }

        // Ask for doctor name using speech recognition OR keypad
        const gather = twiml.gather({
            input: 'speech dtmf', // Allow both!
            action: `${process.env.BASE_URL}/api/voice/doctor-name`,
            method: 'POST',
            timeout: 4,
            speechTimeout: 'auto',
            numDigits: 1, // for the 1 or 2 fallback
            language: 'en-US'  // Switch to US English for better recognition in testing
        });

        gather.say({
            voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
            language: lang === 'en' ? 'en-US' : 'hi-IN'
        }, msg.askDoctorName);

        twiml.redirect(`${process.env.BASE_URL}/api/voice/book-appointment`);

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        console.error('[Book Appointment Error]', error);
        res.status(500).send('Error');
    }
};

// @desc    Handle doctor name input
// @route   POST /api/voice/doctor-name
// @access  Public (Twilio webhook)
const handleDoctorName = async (req, res) => {
    try {
        const twiml = new twilio.twiml.VoiceResponse();
        const callSid = req.body.CallSid;
        const speechResult = req.body.SpeechResult;
        // Allow digits as fallback (1=Sharma, 2=Smith for testing)
        const digits = req.body.Digits;

        // Logic: Prefer Speech, fallback to Digits if defined
        let doctorName = speechResult;
        if (!doctorName && digits === '1') doctorName = 'Vinayak';
        if (!doctorName && digits === '2') doctorName = 'Alok Gupta';

        const session = callSessions.get(callSid) || {};
        const lang = session.language || 'en';
        const msg = messages[lang];

        console.log(`[Doctor Input] Speech: "${speechResult}", Digits: "${digits}", Resolved: "${doctorName}"`);

        if (!doctorName) {
            // No input received, ask again
            twiml.say({
                voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                language: lang === 'en' ? 'en-US' : 'hi-IN'
            }, msg.invalidInput);
            twiml.redirect(`${process.env.BASE_URL}/api/voice/book-appointment`); // Go back to asking name
            res.type('text/xml');
            return res.send(twiml.toString());
        }

        // Store doctor name
        session.doctorName = doctorName;
        session.step = 'ask_date';
        callSessions.set(callSid, session);

        // Ask for date
        const gather = twiml.gather({
            input: 'speech dtmf', // Allow dtmf
            action: `${process.env.BASE_URL}/api/voice/date-selection`,
            method: 'POST',
            timeout: 4,
            speechTimeout: 'auto',
            numDigits: 1,
            language: 'en-US'
        });

        gather.say({
            voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
            language: lang === 'en' ? 'en-US' : 'hi-IN'
        }, msg.askDate);

        twiml.redirect(`${process.env.BASE_URL}/api/voice/doctor-name`);

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        console.error('[Doctor Name Error]', error);
        res.status(500).send('Error');
    }
};

// @desc    Handle date selection
// @route   POST /api/voice/date-selection
// @access  Public (Twilio webhook)
const handleDateSelection = async (req, res) => {
    try {
        const twiml = new twilio.twiml.VoiceResponse();
        const callSid = req.body.CallSid;
        const speechResult = req.body.SpeechResult;

        const session = callSessions.get(callSid) || {};
        const lang = session.language || 'en';
        const msg = messages[lang];

        console.log(`[Date Input] CallSid: ${callSid}, Speech: ${speechResult}`);

        // Sticky Session Logic: If no new speech but we already have a date, ask for time again
        if (!speechResult && session.date) {
            console.log('[Date Input] No speech, but date exists. Re-asking for time.');
            // Ask for time again
            const gather = twiml.gather({
                input: 'speech',
                action: `${process.env.BASE_URL}/api/voice/time-selection`,
                method: 'POST',
                timeout: 8, // Increased timeout
                speechTimeout: 'auto',
                language: 'en-US'
            });

            gather.say({
                voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                language: lang === 'en' ? 'en-US' : 'hi-IN'
            }, msg.askTime);

            twiml.redirect(`${process.env.BASE_URL}/api/voice/date-selection`);
            res.type('text/xml');
            return res.send(twiml.toString());
        }

        if (!speechResult) {
            twiml.say({
                voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                language: lang === 'en' ? 'en-US' : 'hi-IN'
            }, msg.invalidInput);
            twiml.redirect(`${process.env.BASE_URL}/api/voice/doctor-name`); // Go back to asking date
            res.type('text/xml');
            return res.send(twiml.toString());
        }

        // Store date
        session.date = speechResult;
        session.step = 'ask_time';
        callSessions.set(callSid, session);

        // Ask for time
        const gather = twiml.gather({
            input: 'speech',
            action: `${process.env.BASE_URL}/api/voice/time-selection`,
            method: 'POST',
            timeout: 8, // Increased timeout
            speechTimeout: 'auto',
            language: 'en-US'
        });

        gather.say({
            voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
            language: lang === 'en' ? 'en-US' : 'hi-IN'
        }, msg.askTime);

        twiml.redirect(`${process.env.BASE_URL}/api/voice/date-selection`);

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        console.error('[Date Selection Error]', error);
        res.status(500).send('Error');
    }
};

// ... (skipping handleTimeSelection, etc.)

// Helper function to parse spoken date
const parseSpokenDate = (spokenDate) => {
    const today = new Date();
    const lowerDate = spokenDate.toLowerCase();

    if (lowerDate.includes('today')) {
        return today;
    }
    if (lowerDate.includes('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    }

    // Try to extract date components
    const months = {
        'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
        'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
    };

    for (const [monthName, monthIndex] of Object.entries(months)) {
        if (lowerDate.includes(monthName)) {
            const dayMatch = lowerDate.match(/(\d+)/);
            if (dayMatch) {
                const day = parseInt(dayMatch[1]);
                return new Date(today.getFullYear(), monthIndex, day);
            }
        }
    }

    // Fallback: return tomorrow
    const fallback = new Date(today);
    fallback.setDate(fallback.getDate() + 1);
    return fallback;
};

// @desc    Handle time selection and check availability
// @route   POST /api/voice/time-selection
// @access  Public (Twilio webhook)
const handleTimeSelection = async (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();

    const callSid = req.body.CallSid;
    const speechResult = req.body.SpeechResult;

    const session = callSessions.get(callSid) || {};
    const lang = session.language || 'en';
    const msg = messages[lang];

    console.log(`[Time Input] CallSid: ${callSid}, Speech: ${speechResult}`);

    if (!speechResult) {
        twiml.say({
            voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
            language: lang === 'en' ? 'en-US' : 'hi-IN'
        }, msg.invalidInput);
        twiml.redirect(`${process.env.BASE_URL}/api/voice/date-selection`); // Go back to asking time
        res.type('text/xml');
        return res.send(twiml.toString());
    }

    // Store time
    session.time = speechResult;
    callSessions.set(callSid, session);



    // Tell user we're checking availability
    twiml.say({
        voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
        language: lang === 'en' ? 'en-US' : 'hi-IN'
    }, msg.checkingAvailability);

    // Find doctor by name (fuzzy search)
    try {
        const doctors = await User.find({
            name: { $regex: session.doctorName, $options: 'i' },
            role: 'doctor'
        });

        if (doctors.length === 0) {
            // Doctor not found
            twiml.say({
                voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                language: lang === 'en' ? 'en-US' : 'hi-IN'
            }, lang === 'en'
                ? `Sorry, I could not find a doctor named ${session.doctorName}. Please try again.`
                : `माफ़ कीजिए, मुझे ${session.doctorName} नाम का डॉक्टर नहीं मिला। कृपया दोबारा कोशिश करें।`
            );
            twiml.redirect('/api/voice/book-appointment');
            res.type('text/xml');
            return res.send(twiml.toString());
        }

        const doctor = doctors[0];

        // Parse date from speech (simplified - you may need to enhance this)
        const parsedDate = parseSpokenDate(session.date);
        const parsedTime = parseSpokenTime(session.time);

        // Check if slot is available
        const existingAppointment = await Appointment.findOne({
            doctorId: doctor._id,
            date: parsedDate,
            time: parsedTime,
            status: { $ne: 'cancelled' }
        });

        if (existingAppointment) {
            // Slot not available, find alternative
            const alternativeSlots = await findAlternativeSlots(doctor._id, parsedDate);

            if (alternativeSlots.length > 0) {
                session.alternativeSlots = alternativeSlots;
                session.currentAlternativeIndex = 0;
                callSessions.set(callSid, session);

                const altTime = alternativeSlots[0];
                const gather = twiml.gather({
                    numDigits: 1,
                    action: '/api/voice/alternative-slot',
                    method: 'POST',
                    timeout: 10
                });

                gather.say({
                    voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                    language: lang === 'en' ? 'en-US' : 'hi-IN'
                }, msg.slotNotAvailable.replace('{alternativeTime}', altTime));
            } else {
                const gather = twiml.gather({
                    numDigits: 1,
                    action: '/api/voice/no-slots',
                    method: 'POST',
                    timeout: 10
                });

                gather.say({
                    voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                    language: lang === 'en' ? 'en-US' : 'hi-IN'
                }, msg.noSlotsAvailable);
            }
        } else {
            // Slot available - book it
            const newAppointment = new Appointment({
                patientId: session.userId,
                doctorId: doctor._id,
                date: parsedDate,
                time: parsedTime,
                status: 'confirmed',
                bookedVia: 'voice_call'
            });
            await newAppointment.save();

            // Populate and emit for real-time frontend update
            const populatedAppointment = await Appointment.findById(newAppointment._id)
                .populate('patientId', 'name email phone')
                .populate('doctorId', 'name specialization');

            // Emit Socket.io event for real-time UI update
            if (global.io) {
                global.io.emit('new-appointment', {
                    appointment: populatedAppointment,
                    message: `New appointment booked via phone call`,
                    bookedVia: 'voice_call'
                });
                console.log('📞 Voice appointment emitted via Socket.io');
            }

            const confirmMsg = msg.appointmentConfirmed
                .replace('{doctorName}', doctor.name)
                .replace('{date}', session.date)
                .replace('{time}', session.time);

            twiml.say({
                voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                language: lang === 'en' ? 'en-US' : 'hi-IN'
            }, confirmMsg);

            twiml.say({
                voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                language: lang === 'en' ? 'en-US' : 'hi-IN'
            }, msg.thankYou);

            // Clean up session
            callSessions.delete(callSid);
        }
    } catch (error) {
        console.error('Error processing appointment:', error);
        twiml.say({
            voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
            language: lang === 'en' ? 'en-US' : 'hi-IN'
        }, lang === 'en'
            ? 'Sorry, there was an error processing your request. Please try again later.'
            : 'माफ़ कीजिए, आपके अनुरोध को प्रोसेस करने में त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।'
        );
    }

    twiml.hangup();
    res.type('text/xml');
    res.send(twiml.toString());
};

// @desc    Handle alternative slot selection
// @route   POST /api/voice/alternative-slot
// @access  Public (Twilio webhook)
const handleAlternativeSlot = async (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const callSid = req.body.CallSid;
    const digit = req.body.Digits;

    const session = callSessions.get(callSid) || {};
    const lang = session.language || 'en';
    const msg = messages[lang];

    if (digit === '1') {
        // User accepts alternative slot
        const alternativeTime = session.alternativeSlots[session.currentAlternativeIndex];
        session.time = alternativeTime;

        // Book the appointment with alternative time
        try {
            const doctors = await User.find({
                name: { $regex: session.doctorName, $options: 'i' },
                role: 'doctor'
            });
            const doctor = doctors[0];
            const parsedDate = parseSpokenDate(session.date);

            const newAppointment = new Appointment({
                patientId: session.userId,
                doctorId: doctor._id,
                date: parsedDate,
                time: alternativeTime,
                status: 'confirmed',
                bookedVia: 'voice_call'
            });
            await newAppointment.save();

            // Emit for real-time frontend update
            const populatedAppointment = await Appointment.findById(newAppointment._id)
                .populate('patientId', 'name email phone')
                .populate('doctorId', 'name specialization');

            if (global.io) {
                global.io.emit('new-appointment', {
                    appointment: populatedAppointment,
                    message: `New appointment booked via phone call`,
                    bookedVia: 'voice_call'
                });
                console.log('📞 Voice appointment (alt slot) emitted via Socket.io');
            }

            const confirmMsg = msg.appointmentConfirmed
                .replace('{doctorName}', doctor.name)
                .replace('{date}', session.date)
                .replace('{time}', alternativeTime);

            twiml.say({
                voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                language: lang === 'en' ? 'en-US' : 'hi-IN'
            }, confirmMsg);

            twiml.say({
                voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                language: lang === 'en' ? 'en-US' : 'hi-IN'
            }, msg.thankYou);

            callSessions.delete(callSid);
        } catch (error) {
            console.error('Error booking appointment:', error);
        }
    } else {
        // Try next alternative
        session.currentAlternativeIndex++;

        if (session.currentAlternativeIndex < session.alternativeSlots.length) {
            callSessions.set(callSid, session);
            const altTime = session.alternativeSlots[session.currentAlternativeIndex];

            const gather = twiml.gather({
                numDigits: 1,
                action: `${process.env.BASE_URL}/api/voice/alternative-slot`,
                method: 'POST',
                timeout: 10
            });

            gather.say({
                voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                language: lang === 'en' ? 'en-US' : 'hi-IN'
            }, msg.slotNotAvailable.replace('{alternativeTime}', altTime));
        } else {
            // No more alternatives
            twiml.say({
                voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                language: lang === 'en' ? 'en-US' : 'hi-IN'
            }, msg.noSlotsAvailable);
            twiml.say({
                voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
                language: lang === 'en' ? 'en-US' : 'hi-IN'
            }, msg.thankYou);
            callSessions.delete(callSid);
        }
    }

    twiml.hangup();
    res.type('text/xml');
    res.send(twiml.toString());
};

// @desc    Handle no slots response
// @route   POST /api/voice/no-slots
// @access  Public (Twilio webhook)
const handleNoSlots = async (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const callSid = req.body.CallSid;
    const digit = req.body.Digits;

    const session = callSessions.get(callSid) || {};
    const lang = session.language || 'en';
    const msg = messages[lang];

    if (digit === '1') {
        // Try another date - go back to date selection
        twiml.redirect(`${process.env.BASE_URL}/api/voice/book-appointment`);
    } else {
        // End call
        twiml.say({
            voice: lang === 'en' ? 'Polly.Joanna' : 'Polly.Aditi',
            language: lang === 'en' ? 'en-US' : 'hi-IN'
        }, msg.thankYou);
        callSessions.delete(callSid);
        twiml.hangup();
    }

    res.type('text/xml');
    res.send(twiml.toString());
};

// @desc    Make reminder call to patient
// @route   POST /api/voice/reminder-call
// @access  Private (internal use)
const makeReminderCall = async (appointmentId) => {
    if (!client) {
        console.log('Twilio not configured');
        return { success: false, error: 'Twilio not configured' };
    }

    try {
        const appointment = await Appointment.findById(appointmentId)
            .populate('patientId')
            .populate('doctorId');

        if (!appointment) {
            return { success: false, error: 'Appointment not found' };
        }

        const patient = appointment.patientId;
        const doctor = appointment.doctorId;

        if (!patient.phone) {
            return { success: false, error: 'Patient phone not available' };
        }

        // Make the call
        const call = await client.calls.create({
            url: `${process.env.BASE_URL}/api/voice/reminder-webhook?appointmentId=${appointmentId}`,
            to: `+91${patient.phone}`,
            from: twilioPhoneNumber
        });

        return { success: true, callSid: call.sid };
    } catch (error) {
        console.error('Error making reminder call:', error);
        return { success: false, error: error.message };
    }
};

// @desc    Handle reminder call webhook
// @route   POST /api/voice/reminder-webhook
// @access  Public (Twilio webhook)
const handleReminderWebhook = async (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const appointmentId = req.query.appointmentId;

    try {
        const appointment = await Appointment.findById(appointmentId)
            .populate('patientId')
            .populate('doctorId');

        if (!appointment) {
            twiml.say('Sorry, there was an error with your reminder.');
            twiml.hangup();
            res.type('text/xml');
            return res.send(twiml.toString());
        }

        const patient = appointment.patientId;
        const doctor = appointment.doctorId;

        // Default to English for reminders (can be enhanced to use user preference)
        const lang = 'en';
        const msg = messages[lang];

        const reminderText = msg.reminder
            .replace('{patientName}', patient.name)
            .replace('{doctorName}', doctor.name)
            .replace('{date}', formatDate(appointment.date))
            .replace('{time}', appointment.time);

        const gather = twiml.gather({
            numDigits: 1,
            action: `/api/voice/reminder-response?appointmentId=${appointmentId}`,
            method: 'POST',
            timeout: 10
        });

        gather.say({
            voice: 'Polly.Joanna',
            language: 'en-US'
        }, reminderText);

        twiml.redirect(`/api/voice/reminder-webhook?appointmentId=${appointmentId}`);

    } catch (error) {
        console.error('Error in reminder webhook:', error);
        twiml.say('Sorry, there was an error processing your reminder.');
    }

    res.type('text/xml');
    res.send(twiml.toString());
};

// @desc    Handle reminder response
// @route   POST /api/voice/reminder-response
// @access  Public (Twilio webhook)
const handleReminderResponse = async (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const digit = req.body.Digits;
    const appointmentId = req.query.appointmentId;

    const lang = 'en';
    const msg = messages[lang];

    if (digit === '1') {
        // Confirmed
        await Appointment.findByIdAndUpdate(appointmentId, {
            reminderConfirmed: true,
            reminderConfirmedAt: new Date()
        });

        twiml.say({
            voice: 'Polly.Joanna',
            language: 'en-US'
        }, msg.confirmReminder);
    } else {
        // Wants to reschedule
        twiml.say({
            voice: 'Polly.Joanna',
            language: 'en-US'
        }, msg.rescheduleInfo);
    }

    twiml.say({
        voice: 'Polly.Joanna',
        language: 'en-US'
    }, msg.thankYou);

    twiml.hangup();
    res.type('text/xml');
    res.send(twiml.toString());
};



// Helper function to parse spoken time
const parseSpokenTime = (spokenTime) => {
    // Simplified parser
    const lowerTime = spokenTime.toLowerCase();
    const hourMatch = lowerTime.match(/(\d+)/);

    if (hourMatch) {
        let hour = parseInt(hourMatch[1]);
        const isPM = lowerTime.includes('pm') || lowerTime.includes('evening') || lowerTime.includes('afternoon');
        const isAM = lowerTime.includes('am') || lowerTime.includes('morning');

        if (isPM && hour < 12) hour += 12;
        if (isAM && hour === 12) hour = 0;

        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);

        return `${displayHour}:00 ${period}`;
    }

    return '10:00 AM'; // Default
};

// Helper function to find alternative slots
const findAlternativeSlots = async (doctorId, date) => {
    const allSlots = [
        '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
    ];

    const bookedAppointments = await Appointment.find({
        doctorId,
        date,
        status: { $ne: 'cancelled' }
    });

    const bookedTimes = bookedAppointments.map(a => a.time);
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    return availableSlots.slice(0, 3); // Return up to 3 alternatives
};

// Helper function to format date
const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-IN', options);
};

// @desc    Get debug data (latest users/appointments)
// @route   GET /api/voice/debug
// @access  Public
const getDebugData = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).limit(5);
        const appointments = await Appointment.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('patientId', 'name phone')
            .populate('doctorId', 'name');

        res.json({
            status: 'success',
            connection: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
            latestUsers: users,
            latestAppointments: appointments
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = {
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
};
