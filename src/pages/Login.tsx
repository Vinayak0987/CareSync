import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, User, Phone, 
  Stethoscope, Users, Pill, Globe, Calendar, Droplet, CheckCircle, Shield
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';

type UserRole = 'patient' | 'doctor' | 'pharmacy';
type Language = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn';

interface LoginProps {
  onLogin: (role: UserRole) => void;
  defaultRole?: UserRole;
}

const translations = {
  en: {
    welcome: 'Welcome back!',
    createAccount: 'Create your account',
    signInDesc: 'Enter your details to access your health dashboard',
    signUpDesc: 'Start your journey to better health today',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    loginAs: 'Login as',
    patient: 'Patient',
    doctor: 'Doctor',
    pharmacy: 'Pharmacy',
    demoCredentials: 'Demo Credentials',
    useDemo: 'Use Demo',
    fullName: 'Full Name',
    enterName: 'Enter your full name',
    phone: 'Phone Number',
    enterPhone: 'Enter your phone number',
    email: 'Email Address',
    enterEmail: 'Enter your email',
    password: 'Password',
    enterPassword: 'Enter your password',
    forgotPassword: 'Forgot password?',
    orContinueWith: 'Or continue with',
    terms: 'By continuing, you agree to our',
    termsLink: 'Terms of Service',
    and: 'and',
    privacyLink: 'Privacy Policy',
    yourHealth: 'Your Health,',
    ourPriority: 'Our Priority',
    tagline: 'Connect with doctors, track your vitals, manage prescriptions, and order medicines — all in one place.',
    next: 'Next',
    back: 'Back',
    completeSignup: 'Complete Signup',
    step: 'Step',
    of: 'of',
    basicInfo: 'Basic Information',
    healthInfo: 'Health Details',
    emergencyContact: 'Emergency Contact',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    bloodGroup: 'Blood Group',
    allergies: 'Any Allergies?',
    emergencyName: 'Emergency Contact Name',
    emergencyPhone: 'Emergency Contact Phone',
    optional: 'Optional',
    licenseNumber: 'License Number',
    enterLicense: 'Medical License Number',
    specialty: 'Specialty',
    enterSpecialty: 'e.g. Cardiologist, General Physician',
    experience: 'Years of Experience',
    bio: 'Professional Bio',
    professionalInfo: 'Professional Details',
    enterBio: 'Tell us about your practice...',
    adminId: 'Admin ID',
    enterAdminId: 'Enter your Admin ID',
    department: 'Department',
    enterDepartment: 'e.g. IT, HR, Finance',
    adminInfo: 'Admin Details',
  },
  hi: {
    welcome: 'वापसी पर स्वागत है!',
    createAccount: 'अपना खाता बनाएं',
    signInDesc: 'अपने स्वास्थ्य डैशबोर्ड तक पहुंचने के लिए विवरण दर्ज करें',
    signUpDesc: 'आज ही बेहतर स्वास्थ्य की यात्रा शुरू करें',
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    loginAs: 'के रूप में लॉगिन करें',
    patient: 'मरीज',
    doctor: 'डॉक्टर',
    pharmacy: 'फार्मेसी',
    demoCredentials: 'डेमो क्रेडेंशियल',
    useDemo: 'डेमो उपयोग करें',
    fullName: 'पूरा नाम',
    enterName: 'अपना पूरा नाम दर्ज करें',
    phone: 'फोन नंबर',
    enterPhone: 'अपना फोन नंबर दर्ज करें',
    email: 'ईमेल पता',
    enterEmail: 'अपना ईमेल दर्ज करें',
    password: 'पासवर्ड',
    enterPassword: 'अपना पासवर्ड दर्ज करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    orContinueWith: 'या इसके साथ जारी रखें',
    terms: 'जारी रखकर, आप हमारी मानते हैं',
    termsLink: 'सेवा की शर्तें',
    and: 'और',
    privacyLink: 'गोपनीयता नीति',
    yourHealth: 'आपका स्वास्थ्य,',
    ourPriority: 'हमारी प्राथमिकता',
    tagline: 'डॉक्टरों से जुड़ें, अपने स्वास्थ्य को ट्रैक करें, दवाएं प्रबंधित करें — सब एक जगह।',
    next: 'आगे',
    back: 'पीछे',
    completeSignup: 'पंजीकरण पूर्ण करें',
    step: 'चरण',
    of: 'का',
    basicInfo: 'मूल जानकारी',
    healthInfo: 'स्वास्थ्य विवरण',
    emergencyContact: 'आपातकालीन संपर्क',
    dateOfBirth: 'जन्म तिथि',
    gender: 'लिंग',
    bloodGroup: 'रक्त समूह',
    allergies: 'कोई एलर्जी?',
    emergencyName: 'आपातकालीन संपर्क नाम',
    emergencyPhone: 'आपातकालीन संपर्क फोन',
    optional: 'वैकल्पिक',
    licenseNumber: 'License Number',
    enterLicense: 'Medical License Number',
    specialty: 'Specialty',
    enterSpecialty: 'e.g. Cardiologist, General Physician',
    experience: 'Years of Experience',
    bio: 'Professional Bio',
    professionalInfo: 'Professional Details',
    enterBio: 'Tell us about your practice...',
    adminId: 'Admin ID',
    enterAdminId: 'Enter your Admin ID',
    department: 'Department',
    enterDepartment: 'e.g. IT, HR, Finance',
    adminInfo: 'Admin Details',
  },
  mr: {
    welcome: 'पुन्हा स्वागत!',
    createAccount: 'तुमचे खाते तयार करा',
    signInDesc: 'तुमच्या आरोग्य डॅशबोर्डवर प्रवेश करण्यासाठी तपशील प्रविष्ट करा',
    signUpDesc: 'आज चांगल्या आरोग्याचा प्रवास सुरू करा',
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    loginAs: 'म्हणून लॉगिन करा',
    patient: 'रुग्ण',
    doctor: 'डॉक्टर',
    pharmacy: 'फार्मसी',
    demoCredentials: 'डेमो क्रेडेंशियल्स',
    useDemo: 'डेमो वापरा',
    fullName: 'पूर्ण नाव',
    enterName: 'तुमचे पूर्ण नाव प्रविष्ट करा',
    phone: 'फोन नंबर',
    enterPhone: 'तुमचा फोन नंबर प्रविष्ट करा',
    email: 'ईमेल पत्ता',
    enterEmail: 'तुमचा ईमेल प्रविष्ट करा',
    password: 'पासवर्ड',
    enterPassword: 'तुमचा पासवर्ड प्रविष्ट करा',
    forgotPassword: 'पासवर्ड विसरलात?',
    orContinueWith: 'किंवा यासह सुरू ठेवा',
    terms: 'सुरू ठेवून, तुम्ही आमच्या मान्य करता',
    termsLink: 'सेवा अटी',
    and: 'आणि',
    privacyLink: 'गोपनीयता धोरण',
    yourHealth: 'तुमचे आरोग्य,',
    ourPriority: 'आमची प्राथमिकता',
    tagline: 'डॉक्टरांशी कनेक्ट व्हा, तुमचे आरोग्य ट्रॅक करा, औषधे व्यवस्थापित करा — सर्व एकाच ठिकाणी।',
    next: 'पुढे',
    back: 'मागे',
    completeSignup: 'नोंदणी पूर्ण करा',
    step: 'चरण',
    of: 'पैकी',
    basicInfo: 'मूळ माहिती',
    healthInfo: 'आरोग्य तपशील',
    emergencyContact: 'आपत्कालीन संपर्क',
    dateOfBirth: 'जन्म तारीख',
    gender: 'लिंग',
    bloodGroup: 'रक्त गट',
    allergies: 'कोणतीही अॅलर्जी?',
    emergencyName: 'आपत्कालीन संपर्क नाव',
    emergencyPhone: 'आपत्कालीन संपर्क फोन',
    optional: 'पर्यायी',
    licenseNumber: 'License Number',
    enterLicense: 'Medical License Number',
    specialty: 'Specialty',
    enterSpecialty: 'e.g. Cardiologist, General Physician',
    experience: 'Years of Experience',
    bio: 'Professional Bio',
    professionalInfo: 'Professional Details',
    enterBio: 'Tell us about your practice...',
    adminId: 'Admin ID',
    enterAdminId: 'Enter your Admin ID',
    department: 'Department',
    enterDepartment: 'e.g. IT, HR, Finance',
    adminInfo: 'Admin Details',
  },
  ta: {
    welcome: 'மீண்டும் வரவேற்கிறோம்!',
    createAccount: 'உங்கள் கணக்கை உருவாக்கவும்',
    signInDesc: 'உங்கள் சுகாதார டாஷ்போர்டை அணுக விவரங்களை உள்ளிடவும்',
    signUpDesc: 'இன்றே சிறந்த ஆரோக்கியத்திற்கான பயணத்தைத் தொடங்குங்கள்',
    signIn: 'உள்நுழை',
    signUp: 'பதிவு செய்',
    loginAs: 'உள்நுழைக',
    patient: 'நோயாளி',
    doctor: 'மருத்துவர்',
    pharmacy: 'மருந்தகம்',
    demoCredentials: 'டெமோ சான்றுகள்',
    useDemo: 'டெமோ பயன்படுத்து',
    fullName: 'முழு பெயர்',
    enterName: 'உங்கள் முழு பெயரை உள்ளிடவும்',
    phone: 'தொலைபேசி எண்',
    enterPhone: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
    email: 'மின்னஞ்சல் முகவரி',
    enterEmail: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
    password: 'கடவுச்சொல்',
    enterPassword: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    orContinueWith: 'அல்லது இதனுடன் தொடரவும்',
    terms: 'தொடர்வதன் மூலம், நீங்கள் எங்களை ஒப்புக்கொள்கிறீர்கள்',
    termsLink: 'சேவை விதிமுறைகள்',
    and: 'மற்றும்',
    privacyLink: 'தனியுரிமை கொள்கை',
    yourHealth: 'உங்கள் ஆரோக்கியம்,',
    ourPriority: 'எங்கள் முன்னுரிமை',
    tagline: 'மருத்துவர்களுடன் இணையுங்கள், உங்கள் ஆரோக்கியத்தைக் கண்காணியுங்கள் — எல்லாம் ஒரே இடத்தில்.',
    next: 'அடுத்து',
    back: 'பின்',
    completeSignup: 'பதிவை முடிக்கவும்',
    step: 'படி',
    of: 'இல்',
    basicInfo: 'அடிப்படை தகவல்',
    healthInfo: 'சுகாதார விவரங்கள்',
    emergencyContact: 'அவசர தொடர்பு',
    dateOfBirth: 'பிறந்த தேதி',
    gender: 'பாலினம்',
    bloodGroup: 'இரத்த வகை',
    allergies: 'ஏதேனும் அலர்ஜி?',
    emergencyName: 'அவசர தொடர்பு பெயர்',
    emergencyPhone: 'அவசர தொடர்பு எண்',
    optional: 'விருப்பமான',
    licenseNumber: 'License Number',
    enterLicense: 'Medical License Number',
    specialty: 'Specialty',
    enterSpecialty: 'e.g. Cardiologist, General Physician',
    experience: 'Years of Experience',
    bio: 'Professional Bio',
    professionalInfo: 'Professional Details',
    enterBio: 'Tell us about your practice...',
    adminId: 'Admin ID',
    enterAdminId: 'Enter your Admin ID',
    department: 'Department',
    enterDepartment: 'e.g. IT, HR, Finance',
    adminInfo: 'Admin Details',
  },
  te: {
    welcome: 'తిరిగి స్వాగతం!',
    createAccount: 'మీ ఖాతాను సృష్టించండి',
    signInDesc: 'మీ ఆరోగ్య డాష్‌బోర్డ్‌ను యాక్సెస్ చేయడానికి వివరాలను నమోదు చేయండి',
    signUpDesc: 'ఈరోజే మెరుగైన ఆరోగ్యం వైపు ప్రయాణాన్ని ప్రారంభించండి',
    signIn: 'సైన్ ఇన్',
    signUp: 'సైన్ అప్',
    loginAs: 'గా లాగిన్ అవ్వండి',
    patient: 'రోగి',
    doctor: 'డాక్టర్',
    pharmacy: 'ఫార్మసీ',
    demoCredentials: 'డెమో క్రెడెన్షియల్స్',
    useDemo: 'డెమో వాడండి',
    fullName: 'పూర్తి పేరు',
    enterName: 'మీ పూర్తి పేరును నమోదు చేయండి',
    phone: 'ఫోన్ నంబర్',
    enterPhone: 'మీ ఫోన్ నంబర్ నమోదు చేయండి',
    email: 'ఇమెయిల్ చిరునామా',
    enterEmail: 'మీ ఇమెయిల్ నమోదు చేయండి',
    password: 'పాస్‌వర్డ్',
    enterPassword: 'మీ పాస్‌వర్డ్ నమోదు చేయండి',
    forgotPassword: 'పాస్‌వర్డ్ మర్చిపోయారా?',
    orContinueWith: 'లేదా దీనితో కొనసాగించండి',
    terms: 'కొనసాగించడం ద్వారా, మీరు మా అంగీకరిస్తున్నారు',
    termsLink: 'సేవా నిబంధనలు',
    and: 'మరియు',
    privacyLink: 'గోప్యతా విధానం',
    yourHealth: 'మీ ఆరోగ్యం,',
    ourPriority: 'మా ప్రాధాన్యత',
    tagline: 'వైద్యులతో కనెక్ట్ అవ్వండి, మీ ఆరోగ్యాన్ని ట్రాక్ చేయండి — అన్నీ ఒకే చోట.',
    next: 'తదుపరి',
    back: 'వెనుకకు',
    completeSignup: 'సైన్‌అప్ పూర్తి చేయండి',
    step: 'దశ',
    of: 'లో',
    basicInfo: 'ప్రాథమిక సమాచారం',
    healthInfo: 'ఆరోగ్య వివరాలు',
    emergencyContact: 'అత్యవసర సంప్రదింపు',
    dateOfBirth: 'పుట్టిన తేదీ',
    gender: 'లింగం',
    bloodGroup: 'రక్త వర్గం',
    allergies: 'ఏదైనా అలర్జీలు?',
    emergencyName: 'అత్యవసర సంప్రదింపు పేరు',
    emergencyPhone: 'అత్యవసర సంప్రదింపు ఫోన్',
    optional: 'ఐచ్ఛికం',
    licenseNumber: 'License Number',
    enterLicense: 'Medical License Number',
    specialty: 'Specialty',
    enterSpecialty: 'e.g. Cardiologist, General Physician',
    experience: 'Years of Experience',
    bio: 'Professional Bio',
    professionalInfo: 'Professional Details',
    enterBio: 'Tell us about your practice...',
    adminId: 'Admin ID',
    enterAdminId: 'Enter your Admin ID',
    department: 'Department',
    enterDepartment: 'e.g. IT, HR, Finance',
    adminInfo: 'Admin Details',
  },
  bn: {
    welcome: 'ফিরে আসার জন্য স্বাগতম!',
    createAccount: 'আপনার অ্যাকাউন্ট তৈরি করুন',
    signInDesc: 'আপনার স্বাস্থ্য ড্যাশবোর্ড অ্যাক্সেস করতে বিবরণ লিখুন',
    signUpDesc: 'আজই ভালো স্বাস্থ্যের পথে যাত্রা শুরু করুন',
    signIn: 'সাইন ইন',
    signUp: 'সাইন আপ',
    loginAs: 'হিসাবে লগইন করুন',
    patient: 'রোগী',
    doctor: 'ডাক্তার',
    pharmacy: 'ফার্মেসি',
    demoCredentials: 'ডেমো ক্রেডেনশিয়াল',
    useDemo: 'ডেমো ব্যবহার করুন',
    fullName: 'পুরো নাম',
    enterName: 'আপনার পুরো নাম লিখুন',
    phone: 'ফোন নম্বর',
    enterPhone: 'আপনার ফোন নম্বর লিখুন',
    email: 'ইমেইল ঠিকানা',
    enterEmail: 'আপনার ইমেইল লিখুন',
    password: 'পাসওয়ার্ড',
    enterPassword: 'আপনার পাসওয়ার্ড লিখুন',
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
    orContinueWith: 'অথবা এর সাথে চালিয়ে যান',
    terms: 'চালিয়ে যাওয়ার মাধ্যমে, আপনি আমাদের মেনে নিচ্ছেন',
    termsLink: 'সেবার শর্তাবলী',
    and: 'এবং',
    privacyLink: 'গোপনীয়তা নীতি',
    yourHealth: 'আপনার স্বাস্থ্য,',
    ourPriority: 'আমাদের অগ্রাধিকার',
    tagline: 'ডাক্তারদের সাথে সংযুক্ত হন, আপনার স্বাস্থ্য ট্র্যাক করুন — সব এক জায়গায়।',
    next: 'পরবর্তী',
    back: 'পিছনে',
    completeSignup: 'সাইনআপ সম্পূর্ণ করুন',
    step: 'ধাপ',
    of: 'এর',
    basicInfo: 'মৌলিক তথ্য',
    healthInfo: 'স্বাস্থ্য বিবরণ',
    emergencyContact: 'জরুরি যোগাযোগ',
    dateOfBirth: 'জন্ম তারিখ',
    gender: 'লিঙ্গ',
    bloodGroup: 'রক্তের গ্রুপ',
    allergies: 'কোনো অ্যালার্জি?',
    emergencyName: 'জরুরি যোগাযোগের নাম',
    emergencyPhone: 'জরুরি যোগাযোগ ফোন',
    optional: 'ঐচ্ছিক',
    licenseNumber: 'License Number',
    enterLicense: 'Medical License Number',
    specialty: 'Specialty',
    enterSpecialty: 'e.g. Cardiologist, General Physician',
    experience: 'Years of Experience',
    bio: 'Professional Bio',
    professionalInfo: 'Professional Details',
    enterBio: 'Tell us about your practice...',
    adminId: 'Admin ID',
    enterAdminId: 'Enter your Admin ID',
    department: 'Department',
    enterDepartment: 'e.g. IT, HR, Finance',
    adminInfo: 'Admin Details',
  },
};

const languageNames = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  bn: 'বাংলা',
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const demoCredentials = {
  patient: { email: 'demo@caresync.com', password: 'demo123' },
  doctor: { email: 'doctor@caresync.com', password: 'doctor123' },
  admin: { email: 'admin@caresync.com', password: 'admin123' },
};

export function Login({ onLogin, defaultRole }: LoginProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole || 'patient');
  const [language, setLanguage] = useState<Language>('en');
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Multi-step signup state
  const [signupStep, setSignupStep] = useState(1);
  const [signupData, setSignupData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    allergies: '',
    emergencyName: '',
    emergencyPhone: '',
  });

  const [uploadingReport, setUploadingReport] = useState(false);

  const t = translations[language];
  const totalSignupSteps = 3;

  const updateSignupData = (field: string, value: string) => {
    setSignupData({ ...signupData, [field]: value });
  };

  const canProceedSignup = () => {
    switch (signupStep) {
      case 1:
        return (
          signupData.fullName &&
          signupData.phone.length === 10 &&
          email &&
          password
        );
      case 2:
        if (selectedRole === 'doctor') {
          return signupData.licenseNumber && signupData.specialty && signupData.experience;
        }
        if (selectedRole === 'pharmacy') {
          return signupData.storeName && signupData.address;
        }
        return signupData.gender && signupData.bloodGroup;
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && signupStep < totalSignupSteps) {
      setSignupStep(signupStep + 1);
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // LOGIN logic
        const response = await api.post('/auth/login', { email, password });

        // Store user data
        localStorage.setItem('user', JSON.stringify(response.data));
        toast.success(`Welcome back, ${response.data.name}!`);

        // Use the role from the response, but if the user selected a different role in UI, warn them or just use response role.
        // For now, we trust the backend's role.
        onLogin(response.data.role as UserRole);
      } else {
        // REGISTER logic
        const registerData = {
          name: signupData.fullName,
          email,
          password,
          phone: signupData.phone,
          role: selectedRole,
          dateOfBirth: signupData.dateOfBirth,
          gender: signupData.gender,
          bloodGroup: signupData.bloodGroup,
          allergies: signupData.allergies,
          emergencyContact: {
            name: signupData.emergencyName,
            phone: signupData.emergencyPhone
          }
        };

        const response = await api.post('/auth/register', registerData);

        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('onboardingComplete', 'true'); // They just did it

        toast.success('Account created successfully! 🎉');
        onLogin(response.data.role as UserRole);
      }
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    const creds = demoCredentials[selectedRole];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  const switchToSignup = () => {
    setIsLogin(false);
    setSignupStep(1);
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setSignupStep(1);
  };

  return (
    <div className="min-h-screen flex">
      {/* Language Selector */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl border border-border shadow-lg hover:shadow-xl transition-all"
          >
            <Globe size={18} className="text-primary" />
            <span className="font-medium text-sm">{languageNames[language]}</span>
          </button>

          {showLangMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-border shadow-xl overflow-hidden"
            >
              {(Object.keys(languageNames) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between",
                    language === lang && "bg-primary/5 text-primary font-medium"
                  )}
                >
                  {languageNames[lang]}
                  {language === lang && <span>✓</span>}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Left Panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-teal-600 p-12 flex-col justify-between relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Heart className="w-7 h-7 text-white" fill="currentColor" />
          </div>
          <span className="text-2xl font-display font-bold text-white">CareSync</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
            {t.yourHealth}<br />
            <span className="text-white/90">{t.ourPriority}</span>
          </h1>
          <p className="text-lg text-white/80 max-w-md">{t.tagline}</p>
        </div>

        <div className="flex items-center gap-8 text-white/70 text-sm relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30" />
              ))}
            </div>
            <span>10,000+ Patients</span>
          </div>
          <div>500+ Verified Doctors</div>
        </div>
      </motion.div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            <span className="text-2xl font-display font-bold gradient-text">CareSync</span>
          </Link>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              {isLogin ? t.welcome : t.createAccount}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin ? t.signInDesc : t.signUpDesc}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex p-1 bg-muted rounded-lg">
            <button
              onClick={switchToLogin}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-md transition-all",
                isLogin ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              {t.signIn}
            </button>
            <button
              onClick={switchToSignup}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-md transition-all",
                !isLogin ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              {t.signUp}
            </button>
          </div>

          {/* Signup Progress */}
          {!isLogin && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t.step} {signupStep} {t.of} {totalSignupSteps}</span>
                <span>{Math.round((signupStep / totalSignupSteps) * 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(signupStep / totalSignupSteps) * 100}%` }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                />
              </div>
              <div className="flex justify-between">
                {[
                  { step: 1, label: t.basicInfo, icon: User },
                  { step: 2, label: t.healthInfo, icon: Droplet },
                  { step: 3, label: t.emergencyContact, icon: Phone },
                ].map(({ step, label, icon: Icon }) => (
                  <div
                    key={step}
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      signupStep >= step ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {signupStep > step ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <Icon size={14} />
                    )}
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Role Selection - Show for signup mode or when no defaultRole */}
          {(!defaultRole || !isLogin) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <p className="text-sm font-medium text-center">{t.loginAs}</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'patient' as UserRole, icon: Users, label: t.patient },
                  { role: 'doctor' as UserRole, icon: Stethoscope, label: t.doctor },
                  { role: 'pharmacy' as UserRole, icon: Pill, label: t.pharmacy },
                ].map(({ role, icon: Icon, label }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      navigate(`/login/${role}`);
                    }}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1",
                      selectedRole === role
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Icon size={20} className={selectedRole === role ? "text-primary" : "text-muted-foreground"} />
                    <span className={cn("font-medium text-xs", selectedRole === role ? "text-primary" : "text-muted-foreground")}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>


            </motion.div>
          )}


          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {/* Login Form */}
              {isLogin && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>{t.email}</Label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder={t.enterEmail}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{t.password}</Label>
                      <button type="button" className="text-sm text-primary hover:underline">
                        {t.forgotPassword}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t.enterPassword}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Signup Step 1: Basic Info */}
              {!isLogin && signupStep === 1 && (
                <motion.div
                  key="signup1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                    <User size={18} className="text-primary" />
                    <span className="font-medium text-sm">{t.basicInfo}</span>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.fullName} *</Label>
                    <Input
                      placeholder={t.enterName}
                      value={signupData.fullName}
                      onChange={(e) => updateSignupData('fullName', e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.phone} *</Label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder={t.enterPhone}
                        value={signupData.phone}
                        onChange={(e) => updateSignupData('phone', e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.email} *</Label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder={t.enterEmail}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.password} *</Label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t.enterPassword}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Signup Step 2: Patient Health Info */}
              {!isLogin && signupStep === 2 && selectedRole === 'patient' && (
                <motion.div
                  key="signup2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-lg">
                    <Droplet size={18} className="text-rose-500" />
                    <span className="font-medium text-sm">{t.healthInfo}</span>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.dateOfBirth}</Label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="date"
                        value={signupData.dateOfBirth}
                        onChange={(e) => updateSignupData('dateOfBirth', e.target.value)}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.gender} *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Male', 'Female', 'Other'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => updateSignupData('gender', g)}
                          className={cn(
                            "p-3 rounded-xl border-2 text-sm font-medium transition-all",
                            signupData.gender === g
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.bloodGroup} *</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {bloodGroups.map((bg) => (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => updateSignupData('bloodGroup', bg)}
                          className={cn(
                            "p-2.5 rounded-xl border-2 text-sm font-bold transition-all",
                            signupData.bloodGroup === bg
                              ? "border-rose-500 bg-rose-50 text-rose-600"
                              : "border-border hover:border-rose-300"
                          )}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.allergies} <span className="text-muted-foreground text-xs">({t.optional})</span></Label>
                    <Input
                      placeholder="e.g., Penicillin, Peanuts, None"
                      value={signupData.allergies}
                      onChange={(e) => updateSignupData('allergies', e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Chronic Diseases</Label>
                    <Select 
                      onValueChange={(value) => updateSignupData('chronicDiseases', value)}
                      value={signupData.chronicDiseases}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select any chronic condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diabetes">Diabetes</SelectItem>
                        <SelectItem value="heart_diseases">Heart Diseases</SelectItem>
                        <SelectItem value="hypertension">Hypertension</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Medical Report <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-4 hover:bg-muted/30 transition-colors">
                      <input
                        type="file"
                        id="medical-report"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadingReport(true);
                            const formData = new FormData();
                            formData.append('report', file);
                            
                             try {
                                toast.info("Uploading and processing report...");
                                const res = await api.post('/reports/upload', formData, {
                                  headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                
                                updateSignupData('medicalReport', res.data.txtFilePath);
                                toast.success("Report processed! Vital data extracted.");
                                console.log("Extracted Text:", res.data.text);
                             } catch (error) {
                                console.error(error);
                                toast.error("Failed to process report");
                             } finally {
                                setUploadingReport(false);
                             }
                          }
                        }}
                      />
                      <label htmlFor="medical-report" className="cursor-pointer flex flex-col items-center gap-2">
                        {uploadingReport ? (
                          <div className="flex flex-col items-center gap-2">
                             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                             <span className="text-xs text-muted-foreground">Extracting data...</span>
                          </div>
                        ) : signupData.medicalReport ? (
                           <div className="flex items-center gap-2 text-primary font-medium">
                             <FileText size={20} />
                             <span className="text-sm">Report Uploaded & Analyzed</span>
                           </div>
                        ) : (
                          <>
                            <Upload size={24} className="text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-medium">Click to upload report</span>
                            <span className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB)</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Signup Step 2: Doctor Professional Details */}
              {!isLogin && signupStep === 2 && selectedRole === 'doctor' && (
                <motion.div
                  key="signup2-doctor"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Stethoscope size={18} className="text-blue-500" />
                    <span className="font-medium text-sm">{t.professionalInfo}</span>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.licenseNumber} *</Label>
                    <Input
                      placeholder={t.enterLicense}
                      value={signupData.licenseNumber}
                      onChange={(e) => updateSignupData('licenseNumber', e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.specialty} *</Label>
                    <Input
                      placeholder={t.enterSpecialty}
                      value={signupData.specialty}
                      onChange={(e) => updateSignupData('specialty', e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.experience} *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={signupData.experience}
                      onChange={(e) => updateSignupData('experience', e.target.value)}
                      className="h-12"
                      min="0"
                    />
                  </div>
                </motion.div>
              )}

              {/* Signup Step 2: Pharmacy Store Details */}
              {!isLogin && signupStep === 2 && selectedRole === 'pharmacy' && (
                <motion.div
                  key="signup2-pharmacy"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Pill size={18} className="text-green-600" />
                    <span className="font-medium text-sm">{t.adminInfo}</span>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.storeName || 'Store Name'} *</Label>
                    <Input
                      placeholder={t.enterStoreName || 'Enter your store name'}
                      value={signupData.storeName || ''}
                      onChange={(e) => updateSignupData('storeName', e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.address || 'Store Address'} *</Label>
                    <Input
                      placeholder={t.enterAddress || 'Enter complete address'}
                      value={signupData.address || ''}
                      onChange={(e) => updateSignupData('address', e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.operatingHours || 'Operating Hours'}</Label>
                    <Input
                      placeholder={t.enterOperatingHours || 'e.g., 9 AM - 9 PM'}
                      value={signupData.operatingHours || ''}
                      onChange={(e) => updateSignupData('operatingHours', e.target.value)}
                      className="h-12"
                    />
                  </div>
                </motion.div>
              )}

              {/* Signup Step 3: Patient Emergency Contact */}
              {!isLogin && signupStep === 3 && selectedRole === 'patient' && (
                <motion.div
                  key="signup3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                    <Shield size={18} className="text-amber-600" />
                    <span className="font-medium text-sm">{t.emergencyContact}</span>
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-700">
                      ⚠️ This person will be contacted in case of a health emergency detected by the app.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.emergencyName}</Label>
                    <Input
                      placeholder="e.g., Spouse, Parent, Sibling name"
                      value={signupData.emergencyName}
                      onChange={(e) => updateSignupData('emergencyName', e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.emergencyPhone}</Label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={signupData.emergencyPhone}
                        onChange={(e) => updateSignupData('emergencyPhone', e.target.value)}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      Almost done!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click below to create your account and start your health journey.
                    </p>
                  </div>
                </motion.div>
              )}


              {/* Signup Step 3: Doctor Bio */}
              {!isLogin && signupStep === 3 && selectedRole === 'doctor' && (
                <motion.div
                  key="signup3-doctor"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Stethoscope size={18} className="text-blue-500" />
                    <span className="font-medium text-sm">{t.bio}</span>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.bio}</Label>
                    <textarea
                      placeholder={t.enterBio}
                      value={signupData.bio}
                      onChange={(e) => updateSignupData('bio', e.target.value)}
                      className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      Almost done!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click below to submit your application for verification.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {!isLogin && signupStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSignupStep(signupStep - 1)}
                  className="flex-1 h-12"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  {t.back}
                </Button>
              )}

              <Button
                type="submit"
                className="flex-1 h-12 btn-hero text-base"
                disabled={isLoading || (!isLogin && !canProceedSignup())}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? t.signIn : (signupStep < totalSignupSteps ? t.next : t.completeSignup)}
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Social Login - Only for login */}
          {
            isLogin && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">{t.orContinueWith}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-12" type="button">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" className="h-12" type="button">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    GitHub
                  </Button>
                </div>
              </>
            )
          }

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground">
            {t.terms}{' '}
            <a href="#" className="text-primary hover:underline">{t.termsLink}</a>
            {' '}{t.and}{' '}
            <a href="#" className="text-primary hover:underline">{t.privacyLink}</a>
          </p>
        </motion.div >
      </div >
    </div >
  );
}

export default Login;
