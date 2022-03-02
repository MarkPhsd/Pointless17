import { Component, OnInit, Input, OnDestroy, HostListener } from '@angular/core';
import { AccordionMenu, accordionConfig, SubMenu, IUser, ISite } from 'src/app/_interfaces/index';
import { EMPTY, Observable, of, Subscription, } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { fadeAnimation } from 'src/app/_animations';
import { switchMap } from 'rxjs/operators';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';

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
  tinyMenu          : boolean;
  smallMenu        : boolean;
  _barSize: Subscription
  barSize: boolean;

  initSubscription() {
    this._user = this.authenticationService.user$.subscribe(
        user => {
        user = JSON.parse(localStorage.getItem('user')) as IUser;

        this.user = user
        if (!user || !user.token) {
          this.menus = [] as AccordionMenu[];
          return
        }
        this.user = user;
        this.refreshMenu(user)
      }
    )
  }

  refreshMenu(user: IUser) {
    this.initMenus()
    if (!user || !user.token) {return}
    const site  = this.siteService.getAssignedSite();
    const menu$ = this.menusService.getMainMenu(site)

    menu$.subscribe( data => {
      if (!data) { return }
      this.config = this.mergeConfig(this.options);
      if (data)
        data.filter( item => {
          this.addItemToMenu(item, this.menus)
        })
        this.menus =  [...new Set(this.menus)]
      }, err => {
        // console.log('error refresh menu', err)
      }
    )
    this._barSize = this.toolbarUIService.barSize$.subscribe( data => {
      this.smallMenu = data;
    })

  }

  addItemToMenu(item: AccordionMenu, mainMenu: AccordionMenu[]) {
    if (!mainMenu && item) { return }
    if (item.active) {mainMenu.push(item) }
    this.menus =  [...new Set(this.menus)]
  }

  constructor ( private menusService            : MenusService,
                private userAuthorizationService: UserAuthorizationService,
                private router                  : Router,
                private siteService             : SitesService,
                private toolbarUIService        : ToolBarUIService,
                private authenticationService   : AuthenticationService,
    ) {
    this.site  =  this.siteService.getAssignedSite();
  }

  setSmallMenu() {
    const result = !this.smallMenu
    this.toolbarUIService.updateBarSize(result)
    localStorage.setItem('barSize', String(result))
    this.updateScreenSize();
  }

  // sort(users, 'name', '-age', 'id')
  @HostListener("window:resize", [])
  updateScreenSize() {
    this.tinyMenu = false
    if (window.innerWidth < 599 || this.smallMenu) {
      this.tinyMenu = true
    }
  }

  ngOnInit() {
    this.initMenu()
    this.initSubscription()
  }

  ngOnDestroy() {
    if (this._user) { this._user.unsubscribe() }
    this.initMenus();
  }

  initMenus() {
    this.menus   = [] as AccordionMenu[];
    this.submenu = [] as SubMenu[];
  }

  initMenu() {

    this.initMenus()
    const user = JSON.parse(localStorage.getItem('user')) as IUser;
    console.log('user', this.user)
    if (!user || !user.token) {return}

    const site       = this.siteService.getAssignedSite();
    const menuCheck$ = this.menusService.mainMenuExists(site);

    try {
      menuCheck$.pipe(
        switchMap( data => {

          console.log('menu tiny data', data, user)
          if (!data || !data.result) {return of('empty');}

            // if (user.roles === 'admin') {
            return  this.menusService.createMainMenu(user , site)
            // }
            // if (user) {
              // return  this.menusService.getMenu(site, 'main')
            // }
          }
        )

      ).subscribe( data => {
        if (data === 'empty') {
          console.log('empty')
          return }
        this.refreshMenu(this.user)
      }, error=> {
        console.log('error', error)
      })
    } catch (error) {
      console.log('error', error)
    }


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

