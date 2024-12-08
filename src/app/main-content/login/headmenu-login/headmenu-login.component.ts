import { Component } from '@angular/core';
import { NavigationServiceService } from '../../../../services/NavigationService/navigation-service.service';

@Component({
  selector: 'app-headmenu-login',
  standalone: true,
  imports: [],
  templateUrl: './headmenu-login.component.html',
  styleUrl: './headmenu-login.component.scss'
})
export class HeadmenuLoginComponent {
  constructor(public navigation: NavigationServiceService){}

}
