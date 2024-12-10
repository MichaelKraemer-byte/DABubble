import { Routes } from '@angular/router';
import { LoginComponent } from './main-content/login/login.component';
import { ImprintComponent } from './imprint/imprint.component';
import { LostPasswordComponent } from './main-content/login/lost-password/lost-password.component';
import { ResetPasswordComponent } from './dialog/reset-password/reset-password.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'lost-password', component: LostPasswordComponent },
  { path: 'login', component: LoginComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'auth/action', component: ResetPasswordComponent },
  {
    path: 'start',
    loadChildren: () => import('./main-content/main-content-routing.module').then(m => m.MainContentRoutingModule)
  }
];