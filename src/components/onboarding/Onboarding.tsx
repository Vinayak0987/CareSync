import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Phone, Calendar, Droplet, Heart, AlertCircle, 
  ArrowRight, ArrowLeft, CheckCircle, Home, Users, Pill,
  Shield, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface OnboardingProps {
  onComplete: (userData: UserProfile) => void;
}

interface UserProfile {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  emergencyContact: string;
  emergencyPhone: string;
  allergies: string;
  conditions: string[];
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const commonConditions = [
  'Diabetes',
  'High Blood Pressure',
  'Heart Disease',
  'Asthma',
  'Thyroid',
  'Arthritis',
  'None',
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    emergencyContact: '',
    emergencyPhone: '',
    allergies: '',
    conditions: [],
  });

  const totalSteps = 4;

  const updateProfile = (field: keyof UserProfile, value: string | string[]) => {
    setProfile({ ...profile, [field]: value });
  };

  const toggleCondition = (condition: string) => {
    if (condition === 'None') {
      setProfile({ ...profile, conditions: ['None'] });
    } else {
      const filtered = profile.conditions.filter(c => c !== 'None');
      if (filtered.includes(condition)) {
        setProfile({ ...profile, conditions: filtered.filter(c => c !== condition) });
      } else {
        setProfile({ ...profile, conditions: [...filtered, condition] });
      }
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return profile.fullName && profile.phone && profile.dateOfBirth;
      case 2:
        return profile.gender && profile.bloodGroup;
      case 3:
        return profile.emergencyContact && profile.emergencyPhone;
      default:
        return true;
    }
  };

  const handleComplete = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('onboardingComplete', 'true');
    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <Heart size={32} className="text-white" fill="currentColor" />
          </motion.div>
          <h1 className="text-2xl font-display font-bold">Welcome to CareSync! 🎉</h1>
          <p className="text-muted-foreground mt-1">Let's set up your health profile</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border shadow-xl p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Basic Information</h2>
                    <p className="text-xs text-muted-foreground">Tell us about yourself</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    placeholder="Enter your full name"
                    value={profile.fullName}
                    onChange={(e) => updateProfile('fullName', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={profile.phone}
                    onChange={(e) => updateProfile('phone', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
                    className="h-12"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Health Info */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <Droplet size={20} className="text-rose-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Health Details</h2>
                    <p className="text-xs text-muted-foreground">Important for emergencies</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => updateProfile('gender', g)}
                        className={cn(
                          "p-3 rounded-xl border-2 text-sm font-medium transition-all",
                          profile.gender === g
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
                  <Label>Blood Group *</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {bloodGroups.map((bg) => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => updateProfile('bloodGroup', bg)}
                        className={cn(
                          "p-3 rounded-xl border-2 text-sm font-bold transition-all",
                          profile.bloodGroup === bg
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
                  <Label>Any Allergies? (Optional)</Label>
                  <Input
                    placeholder="e.g., Penicillin, Peanuts, None"
                    value={profile.allergies}
                    onChange={(e) => updateProfile('allergies', e.target.value)}
                    className="h-12"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Emergency Contact */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Phone size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Emergency Contact</h2>
                    <p className="text-xs text-muted-foreground">Who should we call in emergency?</p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-sm text-amber-800">
                    ⚠️ This person will be contacted if we detect any health emergency or if you press the SOS button.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Contact Name *</Label>
                  <Input
                    placeholder="e.g., Spouse, Parent, Sibling"
                    value={profile.emergencyContact}
                    onChange={(e) => updateProfile('emergencyContact', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Phone *</Label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={profile.emergencyPhone}
                    onChange={(e) => updateProfile('emergencyPhone', e.target.value)}
                    className="h-12"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 4: Medical Conditions */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Pill size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Medical Conditions</h2>
                    <p className="text-xs text-muted-foreground">Select any that apply</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {commonConditions.map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => toggleCondition(condition)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-sm font-medium transition-all text-left flex items-center gap-2",
                        profile.conditions.includes(condition)
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-border hover:border-purple-300"
                      )}
                    >
                      {profile.conditions.includes(condition) ? (
                        <CheckCircle size={16} className="text-purple-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      {condition}
                    </button>
                  ))}
                </div>

                {/* Summary */}
                <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    You're all set!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your profile will help us provide personalized care and quick emergency response.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1 h-12"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 h-12 btn-hero"
              >
                Continue
                <ArrowRight size={18} className="ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="flex-1 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <CheckCircle size={18} className="mr-2" />
                Complete Setup
              </Button>
            )}
          </div>
        </div>

        {/* Skip Option */}
        <p className="text-center mt-4 text-sm text-muted-foreground">
          <button
            onClick={handleComplete}
            className="text-primary hover:underline"
          >
            Skip for now
          </button>
          {' '}• You can update this later in Settings
        </p>
      </motion.div>
    </div>
  );
}
