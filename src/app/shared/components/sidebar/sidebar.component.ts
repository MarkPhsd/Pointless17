import { Component, OnInit, ViewChild } from '@angular/core';
import { IUser}  from 'src/app/_interfaces';
import { AuthenticationService} from 'src/app/_services';
import { AccordionMenu, accordionConfig, SubMenu } from 'src/app/_interfaces/index';
import { Observable,  Subscription } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

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
      console.log('inint menu user', data)
      this.getMenu();
      this.displayRoles()
    })
  }

constructor(
            private authorizationService: AuthenticationService,
            private menusService: MenusService,
            private siteService : SitesService, ) {

            }

  async ngOnInit() {
    console.log('init side bar')
    this.initSubscriptions();
    if (!this.user) { return }
    const site = this.siteService.getAssignedSite()
    await this.menusService.createMainMenu(site);
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
