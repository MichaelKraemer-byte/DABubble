import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Channel } from '../../../../classes/channel.class';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [
    MatIcon,
    CommonModule
  ],
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss',
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
export class ChannelListComponent {
  @Input() channels: Channel[] = [];
  @Input() channelsAreVisible: boolean = true;
  @Output() toggleChannels = new EventEmitter<void>();
  @Output() createChannel = new EventEmitter<void>();
  @Output() selectChannel = new EventEmitter<Channel>();
}
