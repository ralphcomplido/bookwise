import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Admin } from './pages/admin/admin';
import { Registered } from './pages/registered/registered';
import { Bookkeeper } from './pages/bookkeeper/bookkeeper';
import { Viewer } from './pages/viewer/viewer';
import { requireAccessLevel } from './guards/access-level-guard';
import { Dashboard } from './pages/dashboard/dashboard';
import { Transactions } from './pages/transactions/transactions';
import { Reports } from './pages/reports/reports';
import { EnterExpense } from './pages/enter-expense/enter-expense';
import { EnterIncome } from './pages/enter-income/enter-income';
import { TransferFunds } from './pages/transfer-funds/transfer-funds';
import { JournalEntry } from './pages/journal-entry/journal-entry';
import { Accounts } from './pages/accounts/accounts';

// New report pages (inside reports folder)
import { IncomeReport } from './pages/reports/income/income';
import { ExpenseReport } from './pages/reports/expense/expense';
import { ReportsChart } from './pages/reports/chart/chart';
import { CustomReport } from './pages/reports/custom/custom';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'register', component: Register },

  { path: 'admin', component: Admin, canActivate: [requireAccessLevel(['Admin'])] },

  { path: 'dashboard', component: Dashboard, canActivate: [requireAccessLevel(['Bookkeeper', 'ReportViewer', 'Admin'])] },
  { path: 'accounts', component: Accounts, canActivate: [requireAccessLevel(['Bookkeeper', 'Admin'])] },

  { path: 'transactions', component: Transactions, canActivate: [requireAccessLevel(['Bookkeeper', 'Admin'])] },

  // Reports dashboard
  { path: 'reports', component: Reports, canActivate: [requireAccessLevel(['Bookkeeper', 'ReportViewer', 'Admin'])] },

  // Reports pages (navigation targets)
  { path: 'reports/income', component: IncomeReport, canActivate: [requireAccessLevel(['Bookkeeper', 'ReportViewer', 'Admin'])] },
  { path: 'reports/expense', component: ExpenseReport, canActivate: [requireAccessLevel(['Bookkeeper', 'ReportViewer', 'Admin'])] },
  { path: 'reports/chart', component: ReportsChart, canActivate: [requireAccessLevel(['Bookkeeper', 'ReportViewer', 'Admin'])] },
  { path: 'reports/custom', component: CustomReport, canActivate: [requireAccessLevel(['Bookkeeper', 'ReportViewer', 'Admin'])] },

  { path: 'enter-expense', component: EnterExpense, canActivate: [requireAccessLevel(['Bookkeeper', 'Admin'])] },
  { path: 'enter-income', component: EnterIncome, canActivate: [requireAccessLevel(['Bookkeeper', 'Admin'])] },
  { path: 'transfer-funds', component: TransferFunds, canActivate: [requireAccessLevel(['Bookkeeper', 'Admin'])] },
  { path: 'journal-entry', component: JournalEntry, canActivate: [requireAccessLevel(['Bookkeeper', 'Admin'])] },

  { path: 'registered', component: Registered, canActivate: [requireAccessLevel(['Registered', 'Bookkeeper', 'ReportViewer', 'Admin'])] },

  { path: '**', redirectTo: 'login' }
];
