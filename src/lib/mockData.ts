// Mock data for CareSync-Techathon

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  avatar: string;
  available: boolean;
  nextAvailable?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  reason?: string;
}

export interface Vital {
  id: string;
  type: 'blood_pressure' | 'blood_sugar' | 'heart_rate' | 'temperature' | 'oxygen';
  value: string;
  unit: string;
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical';
}

export interface Prescription {
  id: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  advice: string;
}

export interface ChatMessage {
  id: string;
  sender: 'patient' | 'doctor';
  message: string;
  timestamp: string;
}

export const currentPatient = {
  id: 'patient-001',
  name: 'Ravi Kumar',
  age: 45,
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
};

export const doctors: Doctor[] = [
  {
    id: 'doc-001',
    name: 'Dr. Priya Sharma',
    specialty: 'Cardiology',
    experience: 12,
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    available: true,
  },
  {
    id: 'doc-002',
    name: 'Dr. Arun Mehta',
    specialty: 'General Medicine',
    experience: 8,
    rating: 4.7,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    available: true,
  },
  {
    id: 'doc-003',
    name: 'Dr. Sneha Reddy',
    specialty: 'Orthopedics',
    experience: 15,
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face',
    available: false,
    nextAvailable: '2:00 PM',
  },
  {
    id: 'doc-004',
    name: 'Dr. Vikram Patel',
    specialty: 'Neurology',
    experience: 20,
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face',
    available: true,
  },
];

export const upcomingAppointments: Appointment[] = [
  {
    id: 'apt-001',
    doctorId: 'doc-001',
    doctorName: 'Dr. Priya Sharma',
    specialty: 'Cardiology',
    date: 'Today',
    time: '10:30 AM',
    status: 'upcoming',
    reason: 'Follow-up checkup',
  },
];

export const pastAppointments: Appointment[] = [
  {
    id: 'apt-002',
    doctorId: 'doc-002',
    doctorName: 'Dr. Arun Mehta',
    specialty: 'General Medicine',
    date: 'Jan 25, 2026',
    time: '2:00 PM',
    status: 'completed',
    reason: 'Fever and cold',
  },
  {
    id: 'apt-003',
    doctorId: 'doc-001',
    doctorName: 'Dr. Priya Sharma',
    specialty: 'Cardiology',
    date: 'Jan 15, 2026',
    time: '11:00 AM',
    status: 'completed',
    reason: 'Annual heart checkup',
  },
];

export const currentVitals: Vital[] = [
  {
    id: 'vital-001',
    type: 'blood_pressure',
    value: '120/80',
    unit: 'mmHg',
    timestamp: 'Today, 8:00 AM',
    trend: 'stable',
    status: 'normal',
  },
  {
    id: 'vital-002',
    type: 'blood_sugar',
    value: '105',
    unit: 'mg/dL',
    timestamp: 'Today, 7:30 AM',
    trend: 'down',
    status: 'normal',
  },
  {
    id: 'vital-003',
    type: 'heart_rate',
    value: '72',
    unit: 'bpm',
    timestamp: 'Now',
    trend: 'stable',
    status: 'normal',
  },
  {
    id: 'vital-004',
    type: 'oxygen',
    value: '98',
    unit: '%',
    timestamp: 'Now',
    trend: 'stable',
    status: 'normal',
  },
];

export const prescriptions: Prescription[] = [
  {
    id: 'rx-001',
    doctorName: 'Dr. Priya Sharma',
    date: 'Jan 15, 2026',
    diagnosis: 'Mild hypertension',
    medicines: [
      { name: 'Amlodipine', dosage: '5mg', frequency: '1-0-0', duration: '30 days' },
      { name: 'Aspirin', dosage: '75mg', frequency: '0-0-1', duration: '30 days' },
    ],
    advice: 'Reduce salt intake. Exercise 30 mins daily. Follow up in 4 weeks.',
  },
  {
    id: 'rx-002',
    doctorName: 'Dr. Arun Mehta',
    date: 'Jan 25, 2026',
    diagnosis: 'Viral fever',
    medicines: [
      { name: 'Paracetamol', dosage: '500mg', frequency: '1-1-1', duration: '3 days' },
      { name: 'Cetirizine', dosage: '10mg', frequency: '0-0-1', duration: '5 days' },
    ],
    advice: 'Rest well. Stay hydrated. Avoid cold foods.',
  },
];

export const availableTimeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
];

export const mockChatMessages: ChatMessage[] = [
  { id: '1', sender: 'doctor', message: 'Good morning, Ravi! How are you feeling today?', timestamp: '10:30 AM' },
  { id: '2', sender: 'patient', message: 'Good morning, Doctor. I\'ve been feeling better since the last visit.', timestamp: '10:31 AM' },
  { id: '3', sender: 'doctor', message: 'That\'s great to hear! I see your BP readings have been stable. Are you taking your medications regularly?', timestamp: '10:32 AM' },
  { id: '4', sender: 'patient', message: 'Yes, I haven\'t missed any doses. Also started walking 30 mins every morning.', timestamp: '10:33 AM' },
  { id: '5', sender: 'doctor', message: 'Excellent! Keep it up. Let me check your latest vitals and we can discuss the next steps.', timestamp: '10:34 AM' },
];
