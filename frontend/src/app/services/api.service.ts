import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service, Barber, Appointment, ContactMessage, GalleryImage, BarberPortfolioImage } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/services`);
  }

  getBarbers(): Observable<Barber[]> {
    return this.http.get<Barber[]>(`${this.baseUrl}/barbers`);
  }

  getBarberPortfolio(barberId: number): Observable<BarberPortfolioImage[]> {
    return this.http.get<BarberPortfolioImage[]>(`${this.baseUrl}/barbers/${barberId}/portfolio`);
  }

  getGallery(): Observable<GalleryImage[]> {
    return this.http.get<GalleryImage[]>(`${this.baseUrl}/gallery`);
  }

  checkAvailability(barberId: number, date: string, serviceId: number): Observable<{ available: boolean; reason?: string }> {
    return this.http.get<{ available: boolean; reason?: string }>(
      `${this.baseUrl}/availability?barberId=${barberId}&date=${encodeURIComponent(date)}&serviceId=${serviceId}`
    );
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments`, appointment);
  }

  sendContactMessage(message: ContactMessage): Observable<ContactMessage> {
    return this.http.post<ContactMessage>(`${this.baseUrl}/contact`, message);
  }
}
