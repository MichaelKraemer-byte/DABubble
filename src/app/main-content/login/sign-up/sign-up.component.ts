import { Component, EventEmitter, Output, ViewChild, Input } from '@angular/core';
import { InputFieldComponent } from '../../../shared/header/input-field/input-field.component';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule, AbstractControl, AsyncValidatorFn, ValidationErrors, FormBuilder } from '@angular/forms';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SignUpService } from '../../../../services/sign-up/sign-up.service';
import { LightboxService } from '../../../../services/lightbox/lightbox.service';
import { NavigationServiceService } from '../../../../services/NavigationService/navigation-service.service';
import { Page } from '../../../../interface/pages';



@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    InputFieldComponent,
    RouterModule,
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss','./sign-up-checkbox.scss']
})


export class SignUpComponent {

  myForm: FormGroup

  constructor(private auth: AuthenticationService, private fb: FormBuilder, public signUp: SignUpService , private router: Router, public lightbox: LightboxService, public navigation: NavigationServiceService ) {
    this.myForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email], [this.emailAsyncValidator()]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      dataProtection: ['', [Validators.requiredTrue]]
    });
  }

  @ViewChild(InputFieldComponent) childComponent!: InputFieldComponent;
  fullName: string = '';
  email: string = '';
  password: string = '';

  currentPage?:Page;
  previousPage?:Page;
  nextPage?:Page;

  @Output() eventInChild = new EventEmitter();
  @Input() navigateToType!: (type: string) => void;
  @Input() targetType!: string;


  sendClickToParentPageCounter(index: number = 0) {
    this.eventInChild.emit(index);
  }

  emailAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return of(control.value).pipe(
        debounceTime(300),
        switchMap(email => 
          this.signUp.checkIsEmailAlreadyExists(email).then(
            exists => (exists ? { emailExists: true } : null)
          )
        ),
        catchError(() => of(null))
      );
    };
  }

  areAllInputsFilled():boolean{
    let control;
    for (let each in this.myForm.controls){
      control = this.myForm.controls[each];
      if(!control.value){
        return true;
      }
    }
    return false
  }

  areAllInputsTouched():boolean{
    let control;
    for (let each in this.myForm.controls){
      control = this.myForm.controls[each];
      if(control.untouched) return false;
    }
    return true
  }

  fillValues(){
    this.signUp.fullName = this.myForm.value.fullName || '';
    this.signUp.userEmail = this.myForm.value.email || '';
    this.signUp.password = this.myForm.value.password || '';
    this.myForm.value.fullName = '';
    this.myForm.value.email = '';
    this.myForm.value.password  = '';
  }

  registerUser() {
    this.signUp.signUpUser();
  }

  openLightbox(): void {
    this.lightbox.openLightBox();
  }

  async onSubmit() {
    if (this.myForm.valid) {
      this.fillValues();
      this.navigation.navToPage(2);
      this.myForm.reset();
      Object.keys(this.myForm.controls).forEach(key => {
        const control = this.myForm.get(key);
        control?.markAsPristine();
        control?.markAsUntouched();
        control?.setErrors(null);
      });
        // Wichtiger Schritt: Formular-Status manuell aktualisieren
    this.myForm.updateValueAndValidity({ emitEvent: true });

    // Sicherstellen, dass der Status des Formulars auch im Template erzwungen wird
    setTimeout(() => {
      this.myForm.updateValueAndValidity();
    }, 50);
    }
  }
}