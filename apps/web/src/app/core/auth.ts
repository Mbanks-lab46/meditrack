import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, switchMap, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginResponse, User } from './models/models';

const TOKEN_KEY = 'meditrack_token';
const USER_KEY = 'meditrack_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly user = signal<User | null>(JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'));
  readonly isLoggedIn = computed(() => this.token() !== null);

  login(email: string | null, password: string | null) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          console.log('login response', res);
          localStorage.setItem(TOKEN_KEY, res.accessToken);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.token.set(res.accessToken);
          this.user.set(res.user);
        }),
      );
  }

  register(fullName: string, email: string, password: string): Observable<LoginResponse> {
    const body = {
      fullName,
      email,
      password,
    };
    return this.http
      .post<User>(`${environment.apiUrl}/auth/register`, body)
      .pipe(switchMap(() => this.login(email, password)));
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.user.set(null);
    this.router.navigate(['/login']);
  }
}
