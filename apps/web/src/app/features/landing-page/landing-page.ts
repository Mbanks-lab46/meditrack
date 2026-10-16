import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  protected auth = inject(AuthService);
}
