import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Admin } from './pages/admin/admin';
import { Registered } from './pages/registered/registered';
import { Bookkeeper } from './pages/bookkeeper/bookkeeper';
import { Viewer } from './pages/viewer/viewer';
import { requireAccessLevel } from './guards/access-level-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'register', component: Register },

  { path: 'admin', component: Admin, canActivate: [requireAccessLevel(['Admin'])] },

  // let any authenticated user land here, regardless of role (optional but practical)
  { path: 'registered', component: Registered, canActivate: [requireAccessLevel(['Registered', 'Bookkeeper', 'ReportViewer', 'Admin'])] },

  { path: 'bookkeeper', component: Bookkeeper, canActivate: [requireAccessLevel(['Bookkeeper'])] },
  { path: 'viewer', component: Viewer, canActivate: [requireAccessLevel(['ReportViewer'])] },

  { path: '**', redirectTo: 'login' }
];
