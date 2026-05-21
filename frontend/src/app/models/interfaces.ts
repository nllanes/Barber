export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  icon: string;
  isActive: boolean;
}

export interface Barber {
  id: number;
  name: string;
  specialty: string;
  imageUrl: string;
  phone: string;
  email: string;
  cutDurationMinutes: number;
  isActive: boolean;
  /** Solo al crear/actualizar desde admin; no viene del API. */
  password?: string;
}

export interface Appointment {
  id?: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: number;
  barberId: number;
  appointmentDate: string;
  status?: string;
  createdAt?: string;
  service?: Service;
  barber?: Barber;
}

export interface ContactMessage {
  id?: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt?: string;
  isRead?: boolean;
}

export interface GalleryImage {
  id: number;
  title: string;
  titleEn: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface DashboardStats {
  totalServices: number;
  totalBarbers: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalMessages: number;
  unreadMessages: number;
  totalGalleryImages: number;
}

export interface BarberPortfolioImage {
  id: number;
  barberId: number;
  imageUrl: string;
  caption: string;
  sortOrder: number;
  createdAt?: string;
  isActive: boolean;
}

export interface BarberUnavailableRule {
  id: number;
  barberId: number;
  mode: 'Weekly' | 'SingleDate' | 'DateRange';
  dayOfWeek?: number | null;
  date?: string | null;
  rangeEnd?: string | null;
  allDay: boolean;
  startTimeMinutes?: number | null;
  endTimeMinutes?: number | null;
}
