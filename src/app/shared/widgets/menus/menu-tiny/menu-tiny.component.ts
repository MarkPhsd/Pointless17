import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AccordionMenu, accordionConfig, SubMenu, IUser, ISite } from 'src/app/_interfaces/index';
import { EMPTY, Observable, Subscription, } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { fadeAnimation } from 'src/app/_animations';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-menu-tiny',
  templateUrl: './menu-tiny.component.html',
  styleUrls: ['./menu-tiny.component.scss'],
  animations: [
    fadeAnimation
  ]
})

export class MenuTinyComponent implements OnInit, OnDestroy {

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
  site              : ISite;

  initSubscription() {
    this._user = this.authenticationService.user$.subscribe(
      user => {
        this.user = user
        if (!user) { this.menus = [] as AccordionMenu[]; }
        if (user ) { this.refreshMenu(user) }
      }
    )
  }

  constructor ( private menusService            : MenusService,
    private userAuthorizationService: UserAuthorizationService,
    private router                  : Router,
    private siteService             : SitesService,
    private authenticationService   : AuthenticationService,
    ) {
    this.site  =  this.siteService.getAssignedSite();
  }

  ngOnInit() {
    const site  = this.siteService.getAssignedSite();
    this.initMenu();
    this.initSubscription()
  }

  ngOnDestroy() {
    if (this._user) { this._user.unsubscribe() }
    this.menus = [] as AccordionMenu[];
  }

  refreshMenu(user: IUser) {
    if (!user) { return }
    const site  = this.siteService.getAssignedSite();
    this.menus  = [] as AccordionMenu[];
    if (!this.user) {return}
    const menu$ = this.menusService.getMainMenu(this.site, user)

    menu$.subscribe( data => {
      if (!data) { return }
      this.config = this.mergeConfig(this.options);
      if (data)
        data.filter( item => {
          this.addItemToMenu(item, this.menus)
        })
        // this.menus =  [...new Set(this.menus)]
      }, err => {
        console.log('error refresh menu', err)
      }
    )
  }

  addItemToMenu(item: AccordionMenu, mainMenu: AccordionMenu[]) {
    if (item.active) {mainMenu.push(item) }
    this.menus =  [...new Set(this.menus)]
  }

  initMenu() {
    const site       = this.siteService.getAssignedSite();
    this.menus  = [] as AccordionMenu[];
    if (!this.user) {return}
    const menuCheck$ = this.menusService.mainMenuExists(site);

    menuCheck$.pipe(
      switchMap( data => {
        console.log('data', data)
        if (!data.result) {
           if (this.user) {
            return  this.menusService.createMainMenu(this.user , site)
          }
          return EMPTY;
        }
      })
    ).subscribe(data => {
      this.refreshMenu(this.user)
    })
  }

  mergeConfig(options: accordionConfig) {
    const config = { multi: true  };
    return { ...config, ...options };
  }

  resetMenu() {
    this.displayCategories = false;
  }

  routerNavigation(url: string) {
    this.router.navigate([url]);
  }

  toggle(menu: AccordionMenu, index: number) {
    try {
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
    } catch (error) {
      console.log(error)
    }
  }

  isAuthorized(menu: any): boolean {
    return this.userAuthorizationService.isUserAuthorized(menu.userType)
  }

}

