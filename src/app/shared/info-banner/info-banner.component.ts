import { Component, Input} from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-info-banner',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './info-banner.component.html',
  styleUrl: './info-banner.component.scss',
})
export class InfoBannerComponent {
@Input() text:string = '';
@Input() icon:string = '';
}
