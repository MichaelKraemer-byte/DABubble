import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MessagesService } from '../../../../services/messages/messages.service';
import { MemberService } from '../../../../services/member/member.service';
import {MatDialogModule } from '@angular/material/dialog';


@Component({
  selector: 'app-message-name',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
  ],
  templateUrl: './message-name.component.html',
  styleUrl: './message-name.component.scss'
})
export class MessageNameComponent {
  @Input() message: any;

  constructor(
    public messageService: MessagesService,
    public memberService: MemberService
  ) { }

}
