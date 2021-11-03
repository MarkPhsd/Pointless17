import { Component, OnInit, ViewChild } from '@angular/core';
import { IUser, IUserProfile }  from 'src/app/_interfaces';
import { AuthenticationService, MenuService, UserService} from 'src/app/_services';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { AccordionMenu, accordionConfig,SubMenu } from 'src/app/_interfaces/index';
import { Observable, pipe, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { MenusService } from 'src/app/_services/system/menus.service';
import { SystemService } from 'src/app/_services/system/system.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements OnInit {

  @ViewChild('drawer') drawer: any;

  submenu = {} as SubMenu[]

  accordionConfig : accordionConfig = { multi: false };
  accordionMenu$  : Observable<AccordionMenu[]>;
  accordionMenu   : AccordionMenu[];

  email           : string;
  isAuthorized    : boolean;
  productMenu     : boolean;
  reportMenu      : boolean;
  selectedItem : string;

  _user: Subscription;
  user : IUser;

  initSubscriptions() {
    console.log('init side bar subscriptions')
    this._user =     this.authorizationService.user$.subscribe(data => {
      this.user = data
      this.getMenu();
      this.displayRoles()
    })
  }

constructor(private userService: UserService,
            private breakpointObserver: BreakpointObserver,
            private authorizationService: AuthenticationService,
            private menusService: MenusService,
            private siteService : SitesService,
            private SystemService: SystemService, ) {

    this.initSubscriptions();
  }

  async ngOnInit() {
      const site = this.siteService.getAssignedSite()
      await this.menusService.createMainMenu(site);
      this.initSubscriptions()
    this.selectedItem = ''
  }

  async getMenu() {
    const site  =  this.siteService.getAssignedSite();
    this.accordionMenu$ =  this.menusService.getMainMenu(site)
    this.accordionMenu$.subscribe(data=>{
      this.accordionMenu = data
    })
  }

  displayRoles(){
    if (this.user != undefined) {
    } else {

      if (this.user.roles.toLocaleLowerCase() == 'user')
      {
        this.isAuthorized = false;
      }
      if (this.user.roles.toLocaleLowerCase() == 'admin')
      {
        this.isAuthorized = true;
      }
      if (this.user.roles.toLocaleLowerCase() == 'manager')
      {
        this.isAuthorized = true;
      }
      if (this.user.roles.toLocaleLowerCase() == 'employee')
      {
        this.isAuthorized = true;
      }
      if (this.user.roles.toLocaleLowerCase() == 'cashier')
      {
        this.isAuthorized = true;
      }
    }
  };

}
