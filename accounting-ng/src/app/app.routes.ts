import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Admin } from './pages/admin/admin';
import { Registered } from './pages/registered/registered';
import { Bookkeeper } from './pages/bookkeeper/bookkeeper';
import { Viewer } from './pages/viewer/viewer';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  { path: 'admin', component: Admin },
  { path: 'registered', component: Registered },
  { path: 'bookkeeper', component: Bookkeeper },
  { path: 'viewer', component: Viewer },

  { path: '**', redirectTo: 'login' }
];
