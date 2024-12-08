import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NavigationServiceService } from '../../../../services/NavigationService/navigation-service.service';

@Component({
  selector: 'app-submenu-login',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './submenu-login.component.html',
  styleUrl: './submenu-login.component.scss'
})
export class SubmenuLoginComponent {
  constructor(public router: Router, public navigation: NavigationServiceService){}


  sendTo(nextPage:string = 'privacy-policy'){
    this.navigation.reset();
    this.router.navigate(['/imprint'], { queryParams: { sendToNextPage: nextPage} });
  }
}
