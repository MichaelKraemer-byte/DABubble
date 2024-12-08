import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ThreadHeaderComponent } from "./thread-header/thread-header.component";
import { ThreadMessageFieldComponent } from "./thread-message-field/thread-message-field.component";

import { CommonModule } from '@angular/common';
import { animate, query, style, transition, trigger } from '@angular/animations';
import { EventService } from '../../../services/event/event.service';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { MessageComponent } from "../message/message.component";
import { Thread } from '../../../interface/message';
import { ThreadService } from '../../../services/thread/thread.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    ThreadHeaderComponent,
    ThreadMessageFieldComponent,
    CommonModule,
    MessageComponent
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
  animations: [
    trigger('toggleThread', [
      transition(':enter', [
        style({
          opacity: 0,
          overflow: 'hidden',
          transform: 'translateX(-100%)'
        }),
        animate(
          '125ms ease-out',
          style({
            opacity: 1,
            transform: 'translateX(0)'
          })
        ),
        query('.thread-item', [
          style({ opacity: 0, display: 'none' }),
          animate('125ms ease-out', style({ opacity: 1, display: 'block' }))
        ])
      ]),
      transition(':leave', [
        query('.thread-item', [
          style({ opacity: 1, display: 'block' }),
          animate('125ms ease-out', style({ opacity: 0, display: 'none' }))
        ]),
        animate(
          '125ms ease-in',
          style({
            opacity: 0,
            overflow: 'hidden',
            transform: 'translateX(100%)'
          })
        )
      ])
    ])
  ]
})
export class ThreadComponent implements OnInit {
  threadIsOpen: boolean = false;
  messages: Thread[] = [];
  threadFirstMessage: any= {};
  isThread: boolean = true;
  isThreadFirstMessage: boolean = true;
  private userScrolledUp = false;

  @ViewChild('threadContainer') private threadContainer!: ElementRef;
  private shouldScroll: boolean = true;

  constructor(
    private eventService: EventService, 
    public auth: AuthenticationService,
    public threadService: ThreadService,
  ) { }

  ngOnInit() {
    this.threadService.threadUpdated.subscribe(() => {
      this.messages = [...this.threadService.threadMessages];
      this.shouldScroll = true;
    });
    this.eventService.event$.subscribe(event => {
      if (event.eventType === 'openThread') {
        this.threadIsOpen = true;
        setTimeout(() => this.scrollToBottom(), 0);
      } else if (event.eventType === 'closeThread') {
        this.threadIsOpen = false;
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll && !this.userScrolledUp) {
      setTimeout(() => this.scrollToBottom(), 0);
      this.shouldScroll = false;
    }
  }

  scrollToBottom(): void {
    try {
      if (!this.threadContainer) {
        return;
      }
      const container = this.threadContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
    }
  }

  onScroll(): void {
    const container = this.threadContainer.nativeElement;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
    if (isAtBottom) {
      this.userScrolledUp = false;
    } else {
      this.userScrolledUp = true; 
    }
  }

  toggleThread() {
    this.threadIsOpen = !this.threadIsOpen;
    if (this.threadIsOpen) {
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }


}
