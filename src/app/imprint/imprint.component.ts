import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { NavigationServiceService } from '../../services/NavigationService/navigation-service.service';



@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [MatIcon, PrivacyPolicyComponent, LegalNoticeComponent, RouterModule,],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {
  constructor(public router: Router, public route: ActivatedRoute, public navigation: NavigationServiceService){}
  currentPage:string = '';
  backToLogin(){
    this.router.navigate(['login']);
  }

  ngOnInit(){
    this.route.queryParamMap.subscribe(params => {
      this.currentPage = params.get('sendToNextPage') as string;
    });
  }

}

