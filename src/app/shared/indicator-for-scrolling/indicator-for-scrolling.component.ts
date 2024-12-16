import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationServiceService } from '../../../services/NavigationService/navigation-service.service';


@Component({
  selector: 'scrolling-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicator-for-scrolling.component.html',
  styleUrl: './indicator-for-scrolling.component.scss'
})
export class IndicatorForScrollingComponent {
  constructor(public navigation:  NavigationServiceService ){}

}
