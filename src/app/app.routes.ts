// import { Routes } from '@angular/router';
// import { LoginComponent } from './main-content/login/login.component';
// import { ResetPasswordComponent } from './main-content/login/reset-password/reset-password.component';
// import { ImprintComponent } from './imprint/imprint.component';

// export const routes: Routes = [
//   { path: '', component: LoginComponent },
//   { path: 'lost-password', component: ResetPasswordComponent },
//   { path: 'login', component: LoginComponent },
//   { path: 'imprint', component: ImprintComponent },
//   {
//     path: 'start',
//     loadChildren: () => import('./main-content/main-content-routing.module').then(m => m.MainContentRoutingModule)
//   }
// ];

import { Routes } from '@angular/router';
import { LoginComponent } from './main-content/login/login.component';
import { ResetPasswordComponent } from './main-content/login/reset-password/reset-password.component';
import { ImprintComponent } from './imprint/imprint.component';
import { MainContentComponent } from './main-content/main-content.component';
import { LostPasswordComponent } from './main-content/login/lost-password/lost-password.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'lost-password', component: LostPasswordComponent },
  { path: 'login', component: LoginComponent },
  { path: 'imprint', component: ImprintComponent },
  { 
    path: 'start', 
    loadChildren: () => import('./main-content/main-content-routing.module').then(m => m.MainContentRoutingModule)
  },
  { path: 'auth/action', component: ResetPasswordComponent }
];