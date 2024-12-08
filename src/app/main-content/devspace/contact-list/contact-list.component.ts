import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Member } from '../../../../interface/message';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    MatIcon,
    CommonModule
  ],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('125ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('125ms ease-in', style({ height: 0, opacity: 0, overflow: 'hidden' }))
      ])
    ])
  ]
})
export class ContactListComponent {
  @Input() members: Member[] = [];
  @Input() contactsAreVisible: boolean = true;
  @Input() currentMember?: Member | null;
  @Output() toggleContacts = new EventEmitter<void>();
  @Output() selectContact = new EventEmitter<string>();
}
