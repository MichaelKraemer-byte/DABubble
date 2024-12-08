import { Component, ElementRef, HostListener, Renderer2, Input, forwardRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, Validators, ReactiveFormsModule, NgControl  } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,

  ],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFieldComponent),
      multi: true
    }
  ]
})

export class InputFieldComponent implements ControlValueAccessor {
  constructor(private renderer: Renderer2, private elRef: ElementRef,) {}

  @Input() icon: string = 'star'; 
  @Input() addClass: string[] = [];
  @Input() placeholder: string = 'Your placeholder is still empty, please check your html: <app-input-field placerholder=`your placerholde`>'; 
  @Input() align_reverse: boolean = false;
  @Input() required: boolean = false;
  @Input() pattern:string = "";
  @Input() type: string = 'text';
  @Input() isPasswordfield:boolean = false;
  @Input() minlength:string = "0";

  // [0] = true or false for is required to has a same Value
  // [1] = true or false is for this inputField is showing ErrorMessages
  // [2] [...] = all inputsValues from Component-/Template-SisterElement.
  @Input() checkForSameValue = [false, false, []];

  minlenghtNumber:number = parseFloat(this.minlength);

  inputControl = new FormControl('', [Validators.required, Validators.minLength(this.minlenghtNumber)]);

  private onChange = (value: any) => {};
  private onTouched = () => {};
  public value:string = '';
  public hidePassword:boolean = false;


  ngOnInit(): void {
    const validators = [];
    if (this.required) {
      validators.push(Validators.required);
    }
    if (this.minlength) {
      validators.push(Validators.minLength(parseInt(this.minlength, 10)));
    }
    if (this.pattern) {
      validators.push(Validators.pattern(this.pattern));
    }
  

    this.inputControl.setValidators(validators);
    this.inputControl.updateValueAndValidity();
  }


  writeValue(value: any): void {
    this.value = value || ''; 
    this.inputControl.setValue(this.value, { emitEvent: false }); 
    this.inputControl.markAsPristine();
    this.inputControl.markAsUntouched();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.inputControl.valueChanges.subscribe(val => {
      this.value = val || '';
      fn(val); 
    });
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }


  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.inputControl.disable() : this.inputControl.enable();
  }
 

  @HostListener('focusin', ['$event'])
  onFocusIn(event: Event): void {
    const parent = this.elRef.nativeElement.querySelector('.custom-input');
    this.renderer.addClass(parent, 'active');
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: Event): void {
    const parent = this.elRef.nativeElement.querySelector('.custom-input');
    this.renderer.removeClass(parent, 'active');
  }

  tooglePasswordVisibility(){
    this.hidePassword = !this.hidePassword;
    this.type = this.hidePassword? 'text' : 'password';
  }

  getValue(){
   return this.value;
  }

}