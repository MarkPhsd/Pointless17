import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ISite, IUser}  from 'src/app/_interfaces';
import { AuthenticationService} from 'src/app/_services';
import { AccordionMenu, accordionConfig, SubMenu } from 'src/app/_interfaces/index';
import { Observable,  Subscription } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-sidebar',

  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements OnInit, OnDestroy {

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
    console.log('side bar components get menu')
    this._user =    this.authorizationService.user$.subscribe(data => {
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
    this.initSubscriptions();
    console.log('sidebar ngOnInit')
  }

  ngOnDestroy() {
    if (this._user)  {this._user.unsubscribe()}
  }

  async getMenu(site: ISite) {
    const accordionMenu$ =  this.menusService.getMenuGroupByNameForEdit(site, 'main')
    accordionMenu$.subscribe(data => {
      console.log('getMenu success', data)
      this.accordionMenu = data;
    }, error => {
      console.log('getMenu error', error)
    })

  }


}
