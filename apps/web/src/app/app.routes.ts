import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
    { path: 'login', 
        loadComponent: () => import('./features/login/login').then((m) => m.Login)
    },
    {
        path: '',
        canActivate: [authGuard],
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'patients' },
            { path: 'patients', 
                loadComponent: () => import('./features/patients/patient-list/patient-list')
                .then((m) => m.PatientList)
            },
            {
                path: 'patients/new', 
                loadComponent: () => import('./features/patients/patient-form/patient-form')
                .then((m) => m.PatientForm)
            },
            {
                path: 'patients/:id',
                loadComponent: () => import('./features/patients/patient-detail/patient-detail')
                .then((m) => m.PatientDetail)
            },
            {
                path: 'patients/:id/edit',
                loadComponent: () => import('./features/patients/patient-form/patient-form')
                .then((m) => m.PatientForm)
            },
            {
                path: 'appointments',
                loadComponent: () => import('./features/appointments/appointment-list/appointment-list')
                .then((m) => m.AppointmentList)
            },
            {
                path: 'appointments/new',
                loadComponent: () => import('./features/appointments/appointment-form/appointment-form')
                .then((m) => m.AppointmentForm)
            }
        ],
    },
    { path: '**', redirectTo: ''},
];
