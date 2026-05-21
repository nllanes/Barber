import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { HeroComponent } from '../hero/hero.component';
import { ServicesComponent } from '../services/services.component';
import { GalleryComponent } from '../gallery/gallery.component';
import { TeamComponent } from '../team/team.component';
import { BookingComponent } from '../booking/booking.component';
import { ContactComponent } from '../contact/contact.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent,
    HeroComponent,
    ServicesComponent,
    GalleryComponent,
    TeamComponent,
    BookingComponent,
    ContactComponent,
    FooterComponent
  ],
  template: `
    <app-header />
    <main>
      <app-hero />
      <app-services />
      <app-gallery />
      <app-team />
      <app-booking />
      <app-contact />
    </main>
    <app-footer />
  `,
  styles: [`
    main {
      overflow-x: hidden;
    }
  `]
})
export class HomeComponent {}
