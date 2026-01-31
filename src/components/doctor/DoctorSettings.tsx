import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Clock,
  Camera,
  Save,
  Mail,
  Phone,
  MapPin,
  Award,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/api';

type SettingsTab = 'profile' | 'notifications' | 'availability' | 'security';

interface DoctorInfo {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  licenseNumber?: string;
  experience?: string;
  avatar?: string;
  bio?: string;
}

export function DoctorSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    experience: '',
    address: '',
    bio: '',
    avatar: ''
  });

  const [notifications, setNotifications] = useState({
    newAppointments: true,
    appointmentReminders: true,
    patientMessages: true,
    emergencyAlerts: true,
    weeklyReports: false,
  });

  const [availability, setAvailability] = useState({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: true, start: '09:00', end: '13:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' },
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Load doctor data from localStorage on mount
  useEffect(() => {
    const loadDoctorData = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setDoctor(userData);
          setProfile({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            specialty: userData.specialty || '',
            licenseNumber: userData.licenseNumber || '',
            experience: userData.experience || '',
            address: userData.address || 'Not set',
            bio: userData.bio || '',
            avatar: userData.avatar || ''
          });
        }
      } catch (error) {
        console.error('Error loading doctor data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctorData();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await api.put('/doctors/profile', {
        name: profile.name,
        specialty: profile.specialty,
        experience: profile.experience,
        bio: profile.bio,
        avatar: profile.avatar
      });

      // Update localStorage with new data
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        const updatedUser = { ...userData, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setDoctor(updatedUser);
      }

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = () => {
    // Save to localStorage for now
    localStorage.setItem('doctorNotificationPrefs', JSON.stringify(notifications));
    toast.success('Notification preferences saved!');
  };

  const handleSaveAvailability = () => {
    // Save to localStorage for now
    localStorage.setItem('doctorAvailability', JSON.stringify(availability));
    toast.success('Availability updated!');
  };

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSaving(true);
    try {
      // Would call API here
      // await api.put('/auth/password', { currentPassword: passwords.current, newPassword: passwords.new });
      toast.success('Password updated successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'security', label: 'Security', icon: Shield },
  ];



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-64 flex-shrink-0"
        >
          <div className="bg-card rounded-xl border border-border p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          {activeTab === 'profile' && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <UserAvatar
                    name={profile.name || 'Doctor'}
                    avatar={doctor?.avatar}
                    size="xl"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-lg">{profile.name || 'Doctor'}</h3>
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <Label className="text-xs text-muted-foreground w-20 shrink-0">Profile Photo URL</Label>
                    <Input
                      value={profile.avatar || ''}
                      onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                      placeholder="https://example.com/photo.jpg"
                      className="h-8 text-xs"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Award size={14} />
                    {profile.specialty || 'Specialty not set'} {profile.experience && `• ${profile.experience} years experience`}
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Specialty</Label>
                  <Input
                    value={profile.specialty}
                    onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={profile.email}
                      disabled
                      className="pl-9 bg-muted"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="pl-9"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>License Number</Label>
                  <Input
                    value={profile.licenseNumber}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Experience (years)</Label>
                  <Input
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    placeholder="e.g., 10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  placeholder="Tell patients about yourself..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving} className="btn-hero">
                {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                Save Changes
              </Button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="font-display font-semibold mb-4">Notification Preferences</h3>

              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [key]: !value })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      value ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm",
                      value ? "right-0.5" : "left-0.5"
                    )} />
                  </button>
                </div>
              ))}

              <Button onClick={handleSaveNotifications} className="btn-hero mt-4">
                <Save size={16} className="mr-2" />
                Save Preferences
              </Button>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="font-display font-semibold mb-4">Weekly Schedule</h3>

              {Object.entries(availability).map(([day, config]) => (
                <div key={day} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                  <button
                    onClick={() => setAvailability({
                      ...availability,
                      [day]: { ...config, enabled: !config.enabled }
                    })}
                    className={cn(
                      "w-10 h-5 rounded-full transition-colors relative flex-shrink-0",
                      config.enabled ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm",
                      config.enabled ? "right-0.5" : "left-0.5"
                    )} />
                  </button>
                  <span className="w-24 font-medium text-sm capitalize">{day}</span>
                  {config.enabled && (
                    <div className="flex items-center gap-2 text-sm">
                      <Input
                        type="time"
                        value={config.start}
                        onChange={(e) => setAvailability({
                          ...availability,
                          [day]: { ...config, start: e.target.value }
                        })}
                        className="w-32 h-8"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={config.end}
                        onChange={(e) => setAvailability({
                          ...availability,
                          [day]: { ...config, end: e.target.value }
                        })}
                        className="w-32 h-8"
                      />
                    </div>
                  )}
                  {!config.enabled && (
                    <span className="text-sm text-muted-foreground">Not available</span>
                  )}
                </div>
              ))}

              <Button onClick={handleSaveAvailability} className="btn-hero mt-4">
                <Save size={16} className="mr-2" />
                Save Schedule
              </Button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h3 className="font-display font-semibold mb-4">Security Settings</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleUpdatePassword} disabled={isSaving} className="btn-hero">
                {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Shield size={16} className="mr-2" />}
                Update Password
              </Button>

              <div className="pt-6 border-t border-border">
                <h4 className="font-medium mb-3">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline">
                  Enable 2FA
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
