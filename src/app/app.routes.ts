import { Routes } from '@angular/router';
import { LoginComponent } from './main-content/login/login.component';
import { ResetPasswordComponent } from './main-content/login/reset-password/reset-password.component';
import { ImprintComponent } from './imprint/imprint.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'lost-password', component: ResetPasswordComponent },
  { path: 'login', component: LoginComponent },
  { path: 'imprint', component: ImprintComponent },
  {
    path: 'start',
    loadChildren: () => import('./main-content/main-content-routing.module').then(m => m.MainContentRoutingModule)
  }
];