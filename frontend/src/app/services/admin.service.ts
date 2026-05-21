import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Service, Barber, Appointment, ContactMessage, GalleryImage, DashboardStats } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin`;

  isLoggedIn = signal(false);
  private token = '';

  constructor() {
    const saved = sessionStorage.getItem('admin_token');
    if (saved) {
      this.token = saved;
      this.isLoggedIn.set(true);
    }
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.token}` });
  }

  login(password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/login`, { password }).pipe(
      tap(res => {
        this.token = res.token;
        this.isLoggedIn.set(true);
        sessionStorage.setItem('admin_token', res.token);
      })
    );
  }

  logout() {
    this.token = '';
    this.isLoggedIn.set(false);
    sessionStorage.removeItem('admin_token');
  }

  // Dashboard
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`, { headers: this.headers() });
  }

  // Services
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/services`, { headers: this.headers() });
  }
  createService(s: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(`${this.baseUrl}/services`, s, { headers: this.headers() });
  }
  updateService(id: number, s: Partial<Service>): Observable<Service> {
    return this.http.put<Service>(`${this.baseUrl}/services/${id}`, s, { headers: this.headers() });
  }
  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/services/${id}`, { headers: this.headers() });
  }

  // Barbers
  getBarbers(): Observable<Barber[]> {
    return this.http.get<Barber[]>(`${this.baseUrl}/barbers`, { headers: this.headers() });
  }
  createBarber(b: Partial<Barber>): Observable<Barber> {
    return this.http.post<Barber>(`${this.baseUrl}/barbers`, b, { headers: this.headers() });
  }
  updateBarber(id: number, b: Partial<Barber>): Observable<Barber> {
    return this.http.put<Barber>(`${this.baseUrl}/barbers/${id}`, b, { headers: this.headers() });
  }
  deleteBarber(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/barbers/${id}`, { headers: this.headers() });
  }

  // Gallery
  getGallery(): Observable<GalleryImage[]> {
    return this.http.get<GalleryImage[]>(`${this.baseUrl}/gallery`, { headers: this.headers() });
  }
  createGalleryImage(img: Partial<GalleryImage>): Observable<GalleryImage> {
    return this.http.post<GalleryImage>(`${this.baseUrl}/gallery`, img, { headers: this.headers() });
  }
  updateGalleryImage(id: number, img: Partial<GalleryImage>): Observable<GalleryImage> {
    return this.http.put<GalleryImage>(`${this.baseUrl}/gallery/${id}`, img, { headers: this.headers() });
  }
  deleteGalleryImage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/gallery/${id}`, { headers: this.headers() });
  }

  // Appointments
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments`, { headers: this.headers() });
  }
  updateAppointmentStatus(id: number, status: string): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.baseUrl}/appointments/${id}/status`, { status }, { headers: this.headers() });
  }
  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/appointments/${id}`, { headers: this.headers() });
  }

  // Upload
  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/upload`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    });
  }

  // Messages
  getMessages(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(`${this.baseUrl}/messages`, { headers: this.headers() });
  }
  markMessageRead(id: number): Observable<ContactMessage> {
    return this.http.put<ContactMessage>(`${this.baseUrl}/messages/${id}/read`, {}, { headers: this.headers() });
  }
  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/messages/${id}`, { headers: this.headers() });
  }
}
