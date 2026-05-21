import { Routes } from '@angular/router';
import { adminGuard } from './admin/admin.guard';
import { barberGuard } from './barber/barber.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'barber/login',
    loadComponent: () => import('./barber/login/barber-login.component').then(m => m.BarberLoginComponent)
  },
  {
    path: 'barber',
    canActivate: [barberGuard],
    loadComponent: () => import('./barber/layout/barber-layout.component').then(m => m.BarberLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'citas' },
      { path: 'citas', loadComponent: () => import('./barber/appointments/barber-appointments.component').then(m => m.BarberAppointmentsComponent) },
      { path: 'trabajos', loadComponent: () => import('./barber/portfolio/barber-portfolio.component').then(m => m.BarberPortfolioComponent) },
      { path: 'disponibilidad', loadComponent: () => import('./barber/schedule/barber-schedule.component').then(m => m.BarberScheduleComponent) }
    ]
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./admin/login/login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'services', loadComponent: () => import('./admin/services-mgmt/services-mgmt.component').then(m => m.ServicesMgmtComponent) },
      { path: 'barbers', loadComponent: () => import('./admin/barbers-mgmt/barbers-mgmt.component').then(m => m.BarbersMgmtComponent) },
      { path: 'gallery', loadComponent: () => import('./admin/gallery-mgmt/gallery-mgmt.component').then(m => m.GalleryMgmtComponent) },
      { path: 'appointments', loadComponent: () => import('./admin/appointments-mgmt/appointments-mgmt.component').then(m => m.AppointmentsMgmtComponent) },
      { path: 'messages', loadComponent: () => import('./admin/messages-mgmt/messages-mgmt.component').then(m => m.MessagesMgmtComponent) },
    ]
  }
];
