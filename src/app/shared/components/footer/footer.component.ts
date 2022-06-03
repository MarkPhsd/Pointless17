import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, HostListener } from '@angular/core';
import { IUser } from 'src/app/_interfaces';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  @ViewChild('footerMenu') footerMenu: TemplateRef<any>;
  smallDevice: boolean;
  isUserStaff         =   false;
  isAdmin             =   false;
  isUser              =   false;
  outlet : TemplateRef<any>;
  user                : IUser;
  userName:           string;
  userRoles:          string;
  employeeName        : string;
  showPOSFunctions =   false;

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.smallDevice = false
    this.outlet  = null;
    if (window.innerWidth < 768) {
       this.smallDevice = true  
       this.outlet = this.footerMenu
    }
  }

  constructor(
    public  toolbarUIService:       ToolBarUIService,
    private  navigationService: NavigationService,
  ) { }

  ngOnInit(): void {
    this.updateScreenSize()
    const i = 0
  }

  getUserInfo() {
    this.initUserInfo();
    let user: IUser;

    if (this.user) { user = this.user  }
    if (!this.user) {
       user = JSON.parse(localStorage.getItem('user')) as IUser;
    }

    if (!user) {  return null }

    this.isAdmin      = false;
    this.userName     = user.username

    if (!user.roles) { return }

    this.userRoles    = user.roles.toLowerCase();
    this.employeeName = user.username;

    if (user.roles === 'admin') {
      this.showPOSFunctions = true;
      this.isAdmin          = true
    }
  }

  initUserInfo() {
    this.userName         = '';
    this.userRoles        = '';
    this.showPOSFunctions = false;
    this.isAdmin          = false;
    this.isUserStaff      = false;
    this.employeeName     = '';
  }

  navPOSOrders() {
    this.smallDeviceLimiter();
    this.navigationService.navPOSOrders()
  }
  
  smallDeviceLimiter() {
    if (this.smallDevice) { this.toolbarUIService.updateOrderBar(false) }
  }

}
