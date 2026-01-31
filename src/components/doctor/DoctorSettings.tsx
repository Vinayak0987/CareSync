import { useState } from 'react';
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
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { currentDoctor } from '@/lib/mockData';
import { toast } from 'sonner';

type SettingsTab = 'profile' | 'notifications' | 'availability' | 'security';

export function DoctorSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [profile, setProfile] = useState({
    name: currentDoctor.name,
    email: currentDoctor.email,
    phone: currentDoctor.phone,
    specialty: currentDoctor.specialty,
    registrationNo: currentDoctor.registrationNo,
    experience: currentDoctor.experience,
    address: 'Mumbai, Maharashtra',
    bio: 'Experienced cardiologist specializing in preventive cardiology and heart failure management.'
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

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  const handleSaveAvailability = () => {
    toast.success('Availability updated!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'security', label: 'Security', icon: Shield },
  ];

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
                  <img
                    src={currentDoctor.avatar}
                    alt={currentDoctor.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
                  />
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Award size={14} />
                    {profile.specialty} • {profile.experience} years experience
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
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="pl-9"
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
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Registration Number</Label>
                  <Input
                    value={profile.registrationNo}
                    onChange={(e) => setProfile({ ...profile, registrationNo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button onClick={handleSaveProfile} className="btn-hero">
                <Save size={16} className="mr-2" />
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
                  <Input type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" placeholder="Confirm new password" />
                </div>
              </div>

              <Button onClick={() => toast.success('Password updated!')} className="btn-hero">
                <Shield size={16} className="mr-2" />
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
