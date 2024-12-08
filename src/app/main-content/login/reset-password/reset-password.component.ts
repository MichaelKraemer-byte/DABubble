import { Component, Output, EventEmitter} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterModule, Router} from '@angular/router';
import { InputFieldComponent } from '../../../shared/header/input-field/input-field.component';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { InfoBannerComponent } from '../../../shared/info-banner/info-banner.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    InputFieldComponent,
    FormsModule,
    ReactiveFormsModule,
    MatIcon,
    RouterModule,
    InfoBannerComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  constructor(public auth:AuthenticationService, private route: ActivatedRoute, private router: Router){
  }

    myFormResetPassword = new FormGroup({
      setNewPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)])
    });

    @Output() eventInResetPassword= new EventEmitter();

    ngOnInit() {
      const oobCode = this.route.snapshot.queryParamMap.get('oobCode');
      oobCode? this.auth.oobCode = oobCode : this.auth.oobCode = '';
    }

    sendClickToParentPageCounter(index: number = 0) {
      this.eventInResetPassword.emit(index);
    }
    
    setNewPassword(){
      if(this.myFormResetPassword.value){
        this.auth.saveNewPassword(this.myFormResetPassword.value.confirmPassword as string);
        this.myFormResetPassword.reset();
        console.log('teste')
        this.auth.enableInfoBanner('New password is set', 'passkey')
          setTimeout(() => {
            this.router.navigate(['login']);
          }, 1750)
      }
    }

}
