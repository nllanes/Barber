import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { BarberService } from '../services/barber.service';

export const barberGuard: CanActivateFn = () => {
  const barber = inject(BarberService);
  const router = inject(Router);

  if (barber.isLoggedIn()) return true;

  router.navigate(['/barber/login']);
  return false;
};
