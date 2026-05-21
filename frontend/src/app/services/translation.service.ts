import { Injectable, signal, computed } from '@angular/core';

export type Lang = 'es' | 'en';

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  es: {
    // Header
    'nav.home': 'Inicio',
    'nav.services': 'Servicios',
    'nav.gallery': 'Galería',
    'nav.team': 'Equipo',
    'nav.booking': 'Reservar',
    'nav.contact': 'Contacto',
    'nav.barber': 'Barberos',

    // Hero
    'hero.welcome': 'BIENVENIDO A',
    'hero.subtitle': 'Donde el estilo se encuentra con la tradición. Más de 10 años creando looks únicos para caballeros exigentes.',
    'hero.cta': 'Reservar Cita',
    'hero.cta2': 'Nuestros Servicios',
    'hero.stat1.number': '10+',
    'hero.stat1.label': 'Años de Experiencia',
    'hero.stat2.number': '5K+',
    'hero.stat2.label': 'Clientes Satisfechos',
    'hero.stat3.number': '3',
    'hero.stat3.label': 'Barberos Expertos',

    // Services
    'services.title': 'Nuestros Servicios',
    'services.subtitle': 'Ofrecemos una amplia gama de servicios profesionales para que luzcas tu mejor versión',
    'service.1.name': 'Corte Clásico',
    'service.1.desc': 'Corte de cabello tradicional con acabado perfecto',
    'service.2.name': 'Corte + Barba',
    'service.2.desc': 'Corte de cabello y perfilado de barba profesional',
    'service.3.name': 'Afeitado Clásico',
    'service.3.desc': 'Afeitado con navaja y toalla caliente',
    'service.4.name': 'Diseño de Barba',
    'service.4.desc': 'Perfilado y diseño personalizado de barba',
    'service.5.name': 'Corte Infantil',
    'service.5.desc': 'Corte especial para los más pequeños',
    'service.6.name': 'Tratamiento Capilar',
    'service.6.desc': 'Tratamiento hidratante y revitalizante',
    'services.min': 'min',

    // Gallery
    'gallery.title': 'Nuestra Galería',
    'gallery.subtitle': 'Algunos de nuestros mejores trabajos que reflejan nuestra pasión por el arte del corte',
    'gallery.1': 'Corte Moderno',
    'gallery.2': 'Diseño de Barba',
    'gallery.3': 'Estilo Clásico',
    'gallery.4': 'Corte Fade',
    'gallery.5': 'Afeitado Premium',
    'gallery.6': 'Acabado Perfecto',

    // Team
    'team.title': 'Nuestro Equipo',
    'team.subtitle': 'Profesionales apasionados dedicados a brindarte la mejor experiencia',
    'barber.1.specialty': 'Cortes Modernos',
    'barber.2.specialty': 'Barbas y Afeitados',
    'barber.3.specialty': 'Cortes Clásicos',
    'team.portfolio': 'Trabajos',

    // Booking
    'booking.title': 'Reserva tu Cita',
    'booking.subtitle': 'Agenda tu visita y asegura tu lugar con tu barbero favorito',
    'booking.success.title': '¡Solicitud enviada!',
    'booking.success.msg': 'Te enviamos un correo a tu email con el resumen (pendiente de que el barbero confirme). El barbero también recibe aviso. El horario queda reservado hasta que acepte o rechace desde su panel.',
    'booking.success.btn': 'Nueva Reserva',
    'booking.name': 'Nombre Completo',
    'booking.name.ph': 'Tu nombre',
    'booking.phone': 'Teléfono',
    'booking.phone.ph': '+1 234 567 890',
    'booking.email': 'Email',
    'booking.email.ph': 'tu@email.com',
    'booking.date': 'Fecha y Hora',
    'booking.service': 'Servicio',
    'booking.service.ph': 'Selecciona un servicio',
    'booking.barber': 'Barbero',
    'booking.barber.ph': 'Selecciona un barbero',
    'booking.submit': 'Confirmar Reserva',
    'booking.loading': 'Reservando...',
    'booking.available': 'Horario disponible con este barbero',
    'booking.unavailable': 'Este barbero ya tiene una cita en ese horario. Por favor selecciona otra hora.',
    'booking.checking': 'Verificando disponibilidad...',
    'booking.scheduleBlock': 'El barbero no acepta citas en ese día u horario (según su disponibilidad).',
    'booking.submitError': 'No se pudo registrar la reserva. Si la API no está en marcha no se guarda nada en el servidor: en otra terminal ejecuta «dotnet run» en la carpeta backend y recarga. Si el problema sigue, revisa la consola de red del navegador.',

    // Contact
    'contact.title': 'Contáctanos',
    'contact.subtitle': '¿Tienes alguna pregunta? Estamos aquí para ayudarte',
    'contact.location': 'Ubicación',
    'contact.address': 'Calle Principal #123, Centro',
    'contact.hours': 'Horarios',
    'contact.hours.weekdays': 'Lun - Vie: 9:00 AM - 8:00 PM',
    'contact.hours.saturday': 'Sáb: 9:00 AM - 6:00 PM',
    'contact.hours.sunday': 'Dom: Cerrado',
    'contact.phone': 'Teléfono',
    'contact.email.label': 'Email',
    'contact.form.name': 'Tu nombre',
    'contact.form.email': 'Tu email',
    'contact.form.phone': 'Tu teléfono',
    'contact.form.message': 'Tu mensaje',
    'contact.form.submit': 'Enviar Mensaje',
    'contact.success': '¡Mensaje enviado! Te responderemos pronto.',

    // Footer
    'footer.desc': 'Tu barbería de confianza donde el estilo y la tradición se encuentran para ofrecerte la mejor experiencia.',
    'footer.links': 'Enlaces Rápidos',
    'footer.schedule': 'Horarios',
    'footer.weekdays': 'Lunes - Viernes',
    'footer.weekdays.hours': '9:00 AM - 8:00 PM',
    'footer.saturday': 'Sábado',
    'footer.saturday.hours': '9:00 AM - 6:00 PM',
    'footer.follow': 'Síguenos',
    'footer.rights': 'Todos los derechos reservados.',
  },
  en: {
    // Header
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.gallery': 'Gallery',
    'nav.team': 'Team',
    'nav.booking': 'Book Now',
    'nav.contact': 'Contact',
    'nav.barber': 'Barbers',

    // Hero
    'hero.welcome': 'WELCOME TO',
    'hero.subtitle': 'Where style meets tradition. Over 10 years creating unique looks for discerning gentlemen.',
    'hero.cta': 'Book Appointment',
    'hero.cta2': 'Our Services',
    'hero.stat1.number': '10+',
    'hero.stat1.label': 'Years of Experience',
    'hero.stat2.number': '5K+',
    'hero.stat2.label': 'Happy Clients',
    'hero.stat3.number': '3',
    'hero.stat3.label': 'Expert Barbers',

    // Services
    'services.title': 'Our Services',
    'services.subtitle': 'We offer a wide range of professional services so you can look your best',
    'service.1.name': 'Classic Haircut',
    'service.1.desc': 'Traditional haircut with a perfect finish',
    'service.2.name': 'Haircut + Beard',
    'service.2.desc': 'Haircut and professional beard grooming',
    'service.3.name': 'Classic Shave',
    'service.3.desc': 'Straight razor shave with hot towel',
    'service.4.name': 'Beard Design',
    'service.4.desc': 'Custom beard shaping and styling',
    'service.5.name': 'Kids Haircut',
    'service.5.desc': 'Special haircut for the little ones',
    'service.6.name': 'Hair Treatment',
    'service.6.desc': 'Hydrating and revitalizing treatment',
    'services.min': 'min',

    // Gallery
    'gallery.title': 'Our Gallery',
    'gallery.subtitle': 'Some of our best work showcasing our passion for the art of cutting',
    'gallery.1': 'Modern Cut',
    'gallery.2': 'Beard Design',
    'gallery.3': 'Classic Style',
    'gallery.4': 'Fade Cut',
    'gallery.5': 'Premium Shave',
    'gallery.6': 'Perfect Finish',

    // Team
    'team.title': 'Our Team',
    'team.subtitle': 'Passionate professionals dedicated to giving you the best experience',
    'barber.1.specialty': 'Modern Cuts',
    'barber.2.specialty': 'Beards & Shaves',
    'barber.3.specialty': 'Classic Cuts',
    'team.portfolio': 'Work',

    // Booking
    'booking.title': 'Book Your Appointment',
    'booking.subtitle': 'Schedule your visit and secure your spot with your favorite barber',
    'booking.success.title': 'Request sent!',
    'booking.success.msg': 'We sent a summary to your email (pending barber confirmation). Your barber is notified too. The slot stays held until they accept or decline from their panel.',
    'booking.success.btn': 'New Booking',
    'booking.name': 'Full Name',
    'booking.name.ph': 'Your name',
    'booking.phone': 'Phone',
    'booking.phone.ph': '+1 234 567 890',
    'booking.email': 'Email',
    'booking.email.ph': 'your@email.com',
    'booking.date': 'Date & Time',
    'booking.service': 'Service',
    'booking.service.ph': 'Select a service',
    'booking.barber': 'Barber',
    'booking.barber.ph': 'Select a barber',
    'booking.submit': 'Confirm Booking',
    'booking.loading': 'Booking...',
    'booking.available': 'This time slot is available with this barber',
    'booking.unavailable': 'This barber already has an appointment at that time. Please select another time.',
    'booking.checking': 'Checking availability...',
    'booking.scheduleBlock': 'This barber is not accepting appointments at that day or time (per their availability rules).',
    'booking.submitError': 'Could not save your booking. If the API is not running nothing is stored: in another terminal run «dotnet run» in the backend folder and reload. If it persists, check the browser network tab.',

    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Have a question? We\'re here to help',
    'contact.location': 'Location',
    'contact.address': '123 Main Street, Downtown',
    'contact.hours': 'Hours',
    'contact.hours.weekdays': 'Mon - Fri: 9:00 AM - 8:00 PM',
    'contact.hours.saturday': 'Sat: 9:00 AM - 6:00 PM',
    'contact.hours.sunday': 'Sun: Closed',
    'contact.phone': 'Phone',
    'contact.email.label': 'Email',
    'contact.form.name': 'Your name',
    'contact.form.email': 'Your email',
    'contact.form.phone': 'Your phone',
    'contact.form.message': 'Your message',
    'contact.form.submit': 'Send Message',
    'contact.success': 'Message sent! We\'ll get back to you soon.',

    // Footer
    'footer.desc': 'Your trusted barbershop where style and tradition come together to give you the best experience.',
    'footer.links': 'Quick Links',
    'footer.schedule': 'Schedule',
    'footer.weekdays': 'Monday - Friday',
    'footer.weekdays.hours': '9:00 AM - 8:00 PM',
    'footer.saturday': 'Saturday',
    'footer.saturday.hours': '9:00 AM - 6:00 PM',
    'footer.follow': 'Follow Us',
    'footer.rights': 'All rights reserved.',
  }
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private currentLang = signal<Lang>(this.detectLanguage());

  lang = this.currentLang.asReadonly();

  t(key: string): string {
    return TRANSLATIONS[this.currentLang()][key] ?? key;
  }

  setLang(lang: Lang) {
    this.currentLang.set(lang);
    document.documentElement.lang = lang;
  }

  private detectLanguage(): Lang {
    const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
    return browserLang === 'en' ? 'en' : 'es';
  }
}
