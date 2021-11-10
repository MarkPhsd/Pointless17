import { Component, OnInit, ViewChild } from '@angular/core';
import { ISite, IUser}  from 'src/app/_interfaces';
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
  selectedItem    = '';

  _user: Subscription;
  user : IUser;
  site: ISite;

  initSubscriptions() {
    this._user =    this.authorizationService.user$.subscribe(data => {
      // console.log('sidebar init subscriptions')
      this.user = data
      this.getMenu(this.site);
    })
  }

  constructor(
            private authorizationService: AuthenticationService,
            private menusService: MenusService,
            private siteService : SitesService, ) {
    const site  =  this.siteService.getAssignedSite();
  }

  async ngOnInit() {
    console.log('sidebar ngOnInit')
    this.initSubscriptions();
    if (!this.user) { return }
    this.initMenu(this.site);
  }

  async initMenu(site: ISite) {
    await this.menusService.createMainMenu(site);
  }

  async getMenu(site: ISite) {
    this.accordionMenu$ =  this.menusService.getMainMenu(site, this.user)
    this.accordionMenu$.subscribe(data=>{
      this.accordionMenu = data
      console.log('user ', this.user.roles);
      console.log('menu', data)
    })
  }


}
