import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-success-creating-account',
  standalone: true,
  imports: [],
  templateUrl: './success-creating-account.component.html',
  styleUrl: './success-creating-account.component.scss'
})
export class SuccessCreatingAccountComponent {
  @Output() eventInSuccess = new EventEmitter();
  sendClickToParentPageCounter(index:number = 0){
    this.eventInSuccess.emit(index);
  }
}
