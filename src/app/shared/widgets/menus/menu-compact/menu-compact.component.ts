import { Component, OnInit, Input } from '@angular/core';
import { AccordionMenu, accordionConfig, SubMenu, IUser, ISite } from 'src/app/_interfaces/index';
import { Observable, Subscription, } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AuthenticationService } from 'src/app/_services';

@Component({
  selector: 'app-menu-compact',
  templateUrl: './menu-compact.component.html',
  styleUrls: ['./menu-compact.component.scss'],
})

export class MenuCompactComponent implements OnInit {

  accordionMenu$:    Observable<AccordionMenu[]>;
  @Input() options;
  @Input() menus:    AccordionMenu[];
  submenu:           SubMenu[];
  config:            accordionConfig;
  displayCategories: boolean;
  index:             number;
  result:            boolean;
  user              : IUser;
  _user             : Subscription;
  site: ISite;
  initSubscription() {
    this._user = this.authenticationService.user$.subscribe( data => {
      this.user = data
      this.getMenu();
    })
  }

  constructor ( private menusService            : MenusService,
                private userAuthorizationService: UserAuthorizationService,
                private router                  : Router,
                private siteService             : SitesService,
                private authenticationService   : AuthenticationService,
              ) {this.site  =  this.siteService.getAssignedSite();}

  async ngOnInit() {
    this.initSubscription();
  }

  async getMenu() {
    // if (!this.user) {  return;    }
    const site  =  this.siteService.getAssignedSite();
    this.config = this.mergeConfig(this.options);
    this.accordionMenu$ =  this.menusService.getMainMenu(site, this.user)
    this.accordionMenu$.subscribe(data=>{
      this.menus = [] as AccordionMenu[];
      data.filter( item => {
        if (item.active) {
          this.menus.push(item)  //= data
        }
      })
    }, err => {
      console.log('err', err)
    })

    this.displayCategories = false;
  }

  async initMenu() {
    const site  = this.siteService.getAssignedSite();
    try {
      this.menusService.createMainMenu(site).subscribe(data => console.log(data))
    } catch (error) {
      console.log('error', error)
    }
  }

  mergeConfig(options: accordionConfig) {
    const config = {
      multi: true
    };
    return { ...config, ...options };
  }

  resetMenu() {
    this.displayCategories = false;
  }

  routerNavigation(url: string) {
    this.router.navigate([url]);
  }

  toggle(menu: AccordionMenu, index: number) {
    this.displayCategories = true
    this.index = index;
    if (!this.config.multi) {
      this.menus.filter(
        (menu, i) => i !== index && menu.active
      ).forEach(menu => menu.active = !menu.active);
    }
    this.menus[index].active = !this.menus[index].active;
    this.submenu  = this.menus[index].submenus
    if (menu.routerLink) {
      this.routerNavigation(menu.routerLink)
    }
  }

  isAuthorized(menu: any): boolean {
    // console.log('isAuthorized from menu compact')
    return this.userAuthorizationService.isUserAuthorized(menu.userType)
  }

}
