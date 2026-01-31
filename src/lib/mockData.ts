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

// Vitals history for charts (7 days)
export interface VitalHistoryEntry {
  date: string;
  systolic: number;
  diastolic: number;
  bloodSugar: number;
  heartRate: number;
  oxygen: number;
}

export const vitalsHistory: VitalHistoryEntry[] = [
  { date: 'Jan 25', systolic: 128, diastolic: 85, bloodSugar: 118, heartRate: 78, oxygen: 97 },
  { date: 'Jan 26', systolic: 125, diastolic: 82, bloodSugar: 112, heartRate: 74, oxygen: 98 },
  { date: 'Jan 27', systolic: 130, diastolic: 88, bloodSugar: 125, heartRate: 80, oxygen: 96 },
  { date: 'Jan 28', systolic: 122, diastolic: 80, bloodSugar: 108, heartRate: 72, oxygen: 98 },
  { date: 'Jan 29', systolic: 118, diastolic: 78, bloodSugar: 102, heartRate: 70, oxygen: 99 },
  { date: 'Jan 30', systolic: 120, diastolic: 80, bloodSugar: 105, heartRate: 72, oxygen: 98 },
  { date: 'Jan 31', systolic: 120, diastolic: 80, bloodSugar: 105, heartRate: 72, oxygen: 98 },
];

// Medication adherence data
export interface AdherenceEntry {
  date: string;
  taken: number;
  total: number;
}

export const medicationAdherence: AdherenceEntry[] = [
  { date: 'Jan 25', taken: 3, total: 3 },
  { date: 'Jan 26', taken: 3, total: 3 },
  { date: 'Jan 27', taken: 2, total: 3 },
  { date: 'Jan 28', taken: 3, total: 3 },
  { date: 'Jan 29', taken: 3, total: 3 },
  { date: 'Jan 30', taken: 2, total: 3 },
  { date: 'Jan 31', taken: 1, total: 3 },
];

// Community posts for wellness
export interface CommunityPost {
  id: string;
  username: string;
  message: string;
  topic: string;
  timestamp: string;
  likes: number;
}

export const communityPosts: CommunityPost[] = [
  {
    id: 'post-001',
    username: 'PeacefulLion',
    message: 'Just completed my 30-day meditation streak! Feeling so much calmer these days.',
    topic: 'Mental Health',
    timestamp: '2 hours ago',
    likes: 24,
  },
  {
    id: 'post-002',
    username: 'HealthyHeart_92',
    message: 'Anyone else managing hypertension with diet changes? Reduced salt has helped me a lot.',
    topic: 'Heart Health',
    timestamp: '4 hours ago',
    likes: 18,
  },
  {
    id: 'post-003',
    username: 'WellnessWarrior',
    message: 'The breathing exercises here are amazing! My anxiety has reduced significantly.',
    topic: 'Anxiety',
    timestamp: '6 hours ago',
    likes: 32,
  },
  {
    id: 'post-004',
    username: 'DiabetesFighter',
    message: 'Tip: Walking after meals really helps control blood sugar spikes 🏃‍♂️',
    topic: 'Diabetes',
    timestamp: '1 day ago',
    likes: 45,
  },
];

// ==================== DOCTOR-SPECIFIC DATA ====================

export const currentDoctor = {
  id: 'doc-001',
  name: 'Dr. Priya Sharma',
  specialty: 'Cardiology',
  experience: 12,
  rating: 4.9,
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
  email: 'doctor@caresync.com',
  phone: '+91 98765 43210',
  registrationNo: 'MCI-12345',
};

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  avatar: string;
  phone: string;
  bloodGroup: string;
  conditions: string[];
}

export const patients: Patient[] = [
  {
    id: 'patient-001',
    name: 'Ravi Kumar',
    age: 45,
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phone: '+91 98765 12345',
    bloodGroup: 'O+',
    conditions: ['Hypertension', 'Diabetes Type 2'],
  },
  {
    id: 'patient-002',
    name: 'Anita Desai',
    age: 32,
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    phone: '+91 98765 23456',
    bloodGroup: 'A+',
    conditions: ['Asthma'],
  },
  {
    id: 'patient-003',
    name: 'Suresh Patel',
    age: 58,
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '+91 98765 34567',
    bloodGroup: 'B+',
    conditions: ['Heart Disease', 'High Cholesterol'],
  },
  {
    id: 'patient-004',
    name: 'Meera Singh',
    age: 28,
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    phone: '+91 98765 45678',
    bloodGroup: 'AB+',
    conditions: [],
  },
  {
    id: 'patient-005',
    name: 'Rajesh Gupta',
    age: 52,
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    phone: '+91 98765 56789',
    bloodGroup: 'O-',
    conditions: ['Diabetes Type 2'],
  },
];

export interface DoctorAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  age: number;
  gender: string;
  time: string;
  reason: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  conditions: string[];
}

export const todaysAppointments: DoctorAppointment[] = [
  {
    id: 'dapt-001',
    patientId: 'patient-001',
    patientName: 'Ravi Kumar',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    age: 45,
    gender: 'Male',
    time: '9:00 AM',
    reason: 'Follow-up for hypertension',
    status: 'completed',
    conditions: ['Hypertension', 'Diabetes Type 2'],
  },
  {
    id: 'dapt-002',
    patientId: 'patient-002',
    patientName: 'Anita Desai',
    patientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    age: 32,
    gender: 'Female',
    time: '9:30 AM',
    reason: 'Chest pain evaluation',
    status: 'completed',
    conditions: ['Asthma'],
  },
  {
    id: 'dapt-003',
    patientId: 'patient-003',
    patientName: 'Suresh Patel',
    patientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    age: 58,
    gender: 'Male',
    time: '10:30 AM',
    reason: 'Post-surgery checkup',
    status: 'in-progress',
    conditions: ['Heart Disease', 'High Cholesterol'],
  },
  {
    id: 'dapt-004',
    patientId: 'patient-004',
    patientName: 'Meera Singh',
    patientAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    age: 28,
    gender: 'Female',
    time: '11:00 AM',
    reason: 'Heart palpitations',
    status: 'waiting',
    conditions: [],
  },
  {
    id: 'dapt-005',
    patientId: 'patient-005',
    patientName: 'Rajesh Gupta',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    age: 52,
    gender: 'Male',
    time: '11:30 AM',
    reason: 'Annual cardiac checkup',
    status: 'waiting',
    conditions: ['Diabetes Type 2'],
  },
  {
    id: 'dapt-006',
    patientId: 'patient-001',
    patientName: 'Ravi Kumar',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    age: 45,
    gender: 'Male',
    time: '2:00 PM',
    reason: 'ECG results review',
    status: 'waiting',
    conditions: ['Hypertension', 'Diabetes Type 2'],
  },
];

// Common medicines for prescription pad
export const commonMedicines = [
  'Amlodipine',
  'Aspirin',
  'Atorvastatin',
  'Clopidogrel',
  'Enalapril',
  'Lisinopril',
  'Losartan',
  'Metoprolol',
  'Nitroglycerin',
  'Warfarin',
  'Digoxin',
  'Furosemide',
];

export const dosageOptions = ['2.5mg', '5mg', '10mg', '20mg', '25mg', '50mg', '75mg', '100mg', '150mg', '200mg', '500mg'];
export const frequencyOptions = ['1-0-0', '0-1-0', '0-0-1', '1-1-0', '1-0-1', '0-1-1', '1-1-1', 'SOS', 'BD', 'TDS'];
export const durationOptions = ['3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '30 days', '60 days', '90 days'];

// ==================== ADMIN / PHARMACIST DATA ====================

export const currentAdmin = {
  id: 'admin-001',
  name: 'Pharmacy Manager',
  email: 'admin@caresync.com',
  role: 'Pharmacist',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
};

export interface InventoryProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  image: string;
  prescription: boolean;
  supplier: string;
  lastRestocked: string;
}

export const inventoryProducts: InventoryProduct[] = [
  { id: 'inv-001', name: 'Paracetamol 500mg', category: 'Pain Relief', price: 45, stock: 250, minStock: 50, status: 'in-stock', image: '💊', prescription: false, supplier: 'Cipla', lastRestocked: '2024-01-28' },
  { id: 'inv-002', name: 'Amlodipine 5mg', category: 'Heart Health', price: 120, stock: 85, minStock: 30, status: 'in-stock', image: '❤️', prescription: true, supplier: 'Sun Pharma', lastRestocked: '2024-01-25' },
  { id: 'inv-003', name: 'Insulin Glargine', category: 'Diabetes', price: 850, stock: 8, minStock: 15, status: 'low-stock', image: '💉', prescription: true, supplier: 'Novo Nordisk', lastRestocked: '2024-01-20' },
  { id: 'inv-004', name: 'Metformin 500mg', category: 'Diabetes', price: 85, stock: 120, minStock: 40, status: 'in-stock', image: '💊', prescription: true, supplier: 'Dr. Reddy\'s', lastRestocked: '2024-01-27' },
  { id: 'inv-005', name: 'Cetirizine 10mg', category: 'Allergy', price: 35, stock: 0, minStock: 25, status: 'out-of-stock', image: '🤧', prescription: false, supplier: 'Cipla', lastRestocked: '2024-01-15' },
  { id: 'inv-006', name: 'Omeprazole 20mg', category: 'Digestive', price: 95, stock: 65, minStock: 20, status: 'in-stock', image: '💊', prescription: true, supplier: 'Lupin', lastRestocked: '2024-01-26' },
  { id: 'inv-007', name: 'Aspirin 75mg', category: 'Heart Health', price: 55, stock: 12, minStock: 25, status: 'low-stock', image: '❤️', prescription: true, supplier: 'Bayer', lastRestocked: '2024-01-22' },
  { id: 'inv-008', name: 'Vitamin D3', category: 'Supplements', price: 250, stock: 180, minStock: 30, status: 'in-stock', image: '☀️', prescription: false, supplier: 'HealthKart', lastRestocked: '2024-01-29' },
  { id: 'inv-009', name: 'Blood Pressure Monitor', category: 'Devices', price: 1299, stock: 15, minStock: 5, status: 'in-stock', image: '🩺', prescription: false, supplier: 'Omron', lastRestocked: '2024-01-24' },
  { id: 'inv-010', name: 'Glucose Test Strips', category: 'Diabetes', price: 450, stock: 5, minStock: 20, status: 'low-stock', image: '🩸', prescription: false, supplier: 'Accu-Chek', lastRestocked: '2024-01-18' },
];

export interface PatientOrder {
  id: string;
  patientName: string;
  patientAvatar: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
  prescription: boolean;
  prescriptionVerified: boolean;
  orderDate: string;
  deliveryAddress: string;
}

export const patientOrders: PatientOrder[] = [
  {
    id: 'ord-001',
    patientName: 'Ravi Kumar',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    items: [
      { name: 'Amlodipine 5mg', quantity: 2, price: 120 },
      { name: 'Metformin 500mg', quantity: 1, price: 85 },
    ],
    total: 325,
    status: 'pending',
    prescription: true,
    prescriptionVerified: true,
    orderDate: '2024-01-31 10:30 AM',
    deliveryAddress: 'Mumbai, Maharashtra',
  },
  {
    id: 'ord-002',
    patientName: 'Anita Desai',
    patientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    items: [
      { name: 'Vitamin D3', quantity: 1, price: 250 },
    ],
    total: 250,
    status: 'processing',
    prescription: false,
    prescriptionVerified: false,
    orderDate: '2024-01-31 09:15 AM',
    deliveryAddress: 'Pune, Maharashtra',
  },
  {
    id: 'ord-003',
    patientName: 'Suresh Patel',
    patientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    items: [
      { name: 'Insulin Glargine', quantity: 1, price: 850 },
      { name: 'Glucose Test Strips', quantity: 2, price: 450 },
    ],
    total: 1750,
    status: 'dispatched',
    prescription: true,
    prescriptionVerified: true,
    orderDate: '2024-01-30 04:45 PM',
    deliveryAddress: 'Ahmedabad, Gujarat',
  },
  {
    id: 'ord-004',
    patientName: 'Meera Singh',
    patientAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    items: [
      { name: 'Paracetamol 500mg', quantity: 3, price: 45 },
    ],
    total: 135,
    status: 'delivered',
    prescription: false,
    prescriptionVerified: false,
    orderDate: '2024-01-29 11:00 AM',
    deliveryAddress: 'Delhi NCR',
  },
  {
    id: 'ord-005',
    patientName: 'Rajesh Gupta',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    items: [
      { name: 'Blood Pressure Monitor', quantity: 1, price: 1299 },
    ],
    total: 1299,
    status: 'pending',
    prescription: false,
    prescriptionVerified: false,
    orderDate: '2024-01-31 11:20 AM',
    deliveryAddress: 'Bangalore, Karnataka',
  },
];

export const stockAlerts = inventoryProducts
  .filter(p => p.status === 'low-stock' || p.status === 'out-of-stock')
  .map(p => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    minStock: p.minStock,
    status: p.status,
  }));

export const productCategories = ['Pain Relief', 'Heart Health', 'Diabetes', 'Allergy', 'Supplements', 'Digestive', 'Devices'];

