import { Component} from '@angular/core';
import { LoginAnimationComponent } from './login-animation/login-animation.component';
import { LoginAnimationInsideComponent } from './login-animation-inside/login-animation-inside.component';
import { RouterModule } from '@angular/router';
import { HeadmenuLoginComponent } from './headmenu-login/headmenu-login.component';
import { SubmenuLoginComponent } from './submenu-login/submenu-login.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { CommonModule } from '@angular/common';
import { ChooseAvatarComponent } from './choose-avatar/choose-avatar.component';
import { LostPasswordComponent } from './lost-password/lost-password.component';
import { InfoBannerComponent } from '../../shared/info-banner/info-banner.component';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { DarkModeService } from '../../../services/darkMode/dark-mode.service';
import { LightboxComponent } from '../../shared/lightbox/lightbox.component';
import { LightboxService } from '../../../services/lightbox/lightbox.service';
import { NavigationServiceService } from '../../../services/NavigationService/navigation-service.service';
import { IndicatorForScrollingComponent } from '../../shared/indicator-for-scrolling/indicator-for-scrolling.component';


interface Page {
  index: number;
  type: string,
  subPages?: Page[];
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    LoginAnimationComponent, 
    LightboxComponent, 
    InfoBannerComponent, 
    CommonModule, 
    LoginAnimationInsideComponent, 
    RouterModule, 
    HeadmenuLoginComponent, 
    SubmenuLoginComponent, 
    SignUpComponent, 
    SignInComponent,
    ChooseAvatarComponent, 
    LostPasswordComponent, 
    IndicatorForScrollingComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', './login-animation.scss']
})

export class LoginComponent {
  constructor(public auth: AuthenticationService, public darkmode: DarkModeService, public lightbox: LightboxService, public navigation: NavigationServiceService){
  }

  pageNumber:number = 0;
  pageNumberTrashHolder:number = 0;
  isStepForwards = false;
  pageMap: Page[] = [
    {index: 0, type: 'login'},
    {index: 1, type: 'register', subPages: [{ index: 1.1, type: 'registerStep-1'}, { index: 1.2, type: 'registerStep-2'}]},
    {index: 2, type: 'lostPassword', subPages: [{ index: 2.1, type: 'lostPassword-1'}, { index: 2.2, type: 'lostPassword-2'}]},
  ]

  setAnimationToken(){
    let token = sessionStorage.getItem("dabubbleStartAnimation");
    this.auth.enableAnimation = token? false : true;
    if(!token){
      setTimeout(() => {
        this.auth.enableAnimation = false;
        sessionStorage.setItem("dabubbleStartAnimation", 'false');
      },3000);
    }
  }

  ngOnInit(){
    this.setAnimationToken();
    this.navigation.checkScrollStatus();
  }


  setNavigationAnimationClass(currentHierarchyIndex:number = 0){
    let newClass = 'still-deactive';
    if(this.navigation.isUntouched && currentHierarchyIndex == 0){
      newClass = 'still-active';
    }
    if(!this.navigation.isUntouched){
      if(currentHierarchyIndex == this.navigation.lastIndex && this.navigation.movingForwards){
        newClass = 'deactive-forwards';
      }
      if(currentHierarchyIndex == this.navigation.nextIndex && this.navigation.movingForwards){
        newClass = 'active-forwards';
      }
      if(currentHierarchyIndex == this.navigation.lastIndex && !this.navigation.movingForwards){
        newClass = 'deactive-backwards';
      }
      if(currentHierarchyIndex == this.navigation.nextIndex && !this.navigation.movingForwards){
        newClass = 'active-backwards';
      }
    }
    return newClass;
  }
}
