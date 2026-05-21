import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Appointment, Barber, BarberPortfolioImage, BarberUnavailableRule } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BarberService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/barber`;

  isLoggedIn = signal(false);
  barberName = signal('');
  /** Citas en EsperandoBarbero / Pendiente — actualizado al cargar citas y por polling en el layout. */
  pendingApprovalCount = signal(0);
  private token = '';

  constructor() {
    const saved = sessionStorage.getItem('barber_token');
    const name = sessionStorage.getItem('barber_name');
    if (saved) {
      this.token = saved;
      this.isLoggedIn.set(true);
      if (name) this.barberName.set(name);
    }
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.token}` });
  }

  login(email: string, password: string): Observable<{ token: string; barberName: string }> {
    return this.http.post<{ token: string; barberName: string }>(`${environment.apiUrl}/barber/login`, { email, password }).pipe(
      tap(res => {
        this.token = res.token;
        this.barberName.set(res.barberName);
        this.isLoggedIn.set(true);
        sessionStorage.setItem('barber_token', res.token);
        sessionStorage.setItem('barber_name', res.barberName);
      })
    );
  }

  logout() {
    this.token = '';
    this.isLoggedIn.set(false);
    this.barberName.set('');
    this.pendingApprovalCount.set(0);
    sessionStorage.removeItem('barber_token');
    sessionStorage.removeItem('barber_name');
  }

  /** Coincide con la lógica del panel de citas (camelCase / PascalCase desde el API). */
  static statusOf(a: Appointment & { Status?: string }): string {
    const v = a.status ?? a.Status;
    return typeof v === 'string' ? v.trim() : '';
  }

  static isPendingApproval(a: Appointment & { Status?: string }): boolean {
    const s = BarberService.statusOf(a);
    return s === 'EsperandoBarbero' || s === 'Pendiente';
  }

  syncPendingApprovalBadge(appointments: Appointment[]): void {
    const n = appointments.filter(a => BarberService.isPendingApproval(a)).length;
    this.pendingApprovalCount.set(n);
  }

  getMe(): Observable<Barber> {
    return this.http.get<Barber>(`${this.baseUrl}/me`, { headers: this.headers() });
  }

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments`, { headers: this.headers() });
  }

  accept(id: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.baseUrl}/appointments/${id}/accept`, {}, { headers: this.headers() });
  }

  reject(id: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.baseUrl}/appointments/${id}/reject`, {}, { headers: this.headers() });
  }

  getPortfolio(): Observable<BarberPortfolioImage[]> {
    return this.http.get<BarberPortfolioImage[]>(`${this.baseUrl}/portfolio`, { headers: this.headers() });
  }

  createPortfolio(body: Partial<BarberPortfolioImage>): Observable<BarberPortfolioImage> {
    return this.http.post<BarberPortfolioImage>(`${this.baseUrl}/portfolio`, body, { headers: this.headers() });
  }

  updatePortfolio(id: number, body: Partial<BarberPortfolioImage>): Observable<BarberPortfolioImage> {
    return this.http.put<BarberPortfolioImage>(`${this.baseUrl}/portfolio/${id}`, body, { headers: this.headers() });
  }

  deletePortfolio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/portfolio/${id}`, { headers: this.headers() });
  }

  getUnavailableRules(): Observable<BarberUnavailableRule[]> {
    return this.http.get<BarberUnavailableRule[]>(`${this.baseUrl}/unavailable-rules`, { headers: this.headers() });
  }

  createUnavailableRule(body: Record<string, unknown>): Observable<BarberUnavailableRule> {
    return this.http.post<BarberUnavailableRule>(`${this.baseUrl}/unavailable-rules`, body, { headers: this.headers() });
  }

  deleteUnavailableRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/unavailable-rules/${id}`, { headers: this.headers() });
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/upload`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    });
  }
}
