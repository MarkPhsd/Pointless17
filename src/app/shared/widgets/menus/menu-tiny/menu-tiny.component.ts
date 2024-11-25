import { Component, OnInit, Input, OnDestroy, HostListener } from '@angular/core';
import { AccordionMenu, accordionConfig, SubMenu, IUser, ISite, MenuGroup } from 'src/app/_interfaces/index';
import { EMPTY, Observable, of, Subscription, } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { fadeAnimation } from 'src/app/_animations';
import { switchMap } from 'rxjs/operators';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
@Component({
  selector: 'app-menu-tiny',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule],
  templateUrl: './menu-tiny.component.html',
  styleUrls: ['./menu-tiny.component.scss'],
  animations: [
    fadeAnimation
  ]
})

export class MenuTinyComponent implements OnInit, OnDestroy {
  @Input() menuName = 'main';
  accordionMenu$:    Observable<any>;
  @Input() options;
  @Input() menus:    AccordionMenu[];

  menu$             : Observable< AccordionMenu[]>;
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

  submenuposition = '';
  toolbarTiny: boolean;
  sidebarMode: boolean;
  phoneDevice: boolean;
  smallDevice: boolean;
  gridtoggletiny = "grid-toggle-tiny";

  initSubscription() {
    this._user = this.authenticationService.user$.subscribe(
        user => {
        // console.log('user', user)
        if (!user || !user.roles) {
          this.menus = [] as AccordionMenu[];
          return
        }
        this.user = user
        this.refreshMenu(user)
      }
    )
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
    if (this.siteService.phoneDevice) {
      this.submenuposition = 'submenu-position-tiny'
    }
    if (!this.siteService.phoneDevice) {
      this.submenuposition = 'submenu-position'
    }
  }

  ngOnInit() {
    this.initMenus();
    this.refreshToolBarType();
    this.updateScreenSize();
    this.initSubscription()
  }

  refreshToolBarType() {
    if (window.innerHeight >= 750) {
      this.toolbarTiny = true
    } else {
      this.toolbarTiny = false
    }
      if (window.innerWidth > 811) {
        this.smallDevice = false;
        this.siteService.smallDevice = false
      } else {
        this.smallDevice = true;
        this.siteService.smallDevice = true
      }
    if (window.innerWidth <=600) {
      this.phoneDevice = true
      this.siteService.phoneDevice = true
    } else {
      this.phoneDevice = false
      this.siteService.phoneDevice = false
    }
  }

  ngOnDestroy() {
    if (this._user) { this._user.unsubscribe() }
    this.initMenus();
  }

  initMenus() {
    this.menus   = [] as AccordionMenu[];
    this.submenu = [] as SubMenu[];
    this.menu$ = of([])
  }

  setSmallMenu() {
    const result = !this.smallMenu
    this.toolbarUIService.updateBarSize(result)
    localStorage.setItem('barSize', String(result))
    let fixed ;
    if (result == true) {
      fixed = false
    } else {
      fixed = true;
    }
    localStorage.setItem('barSizeFixed', String(fixed))
    this.updateScreenSize();
  }

  expandMenu () {
    const result = false
    // console.log(result)
    this.toolbarUIService.updateBarSize(result)
    localStorage.setItem('barSize', String(result))
    this.updateScreenSize();
    // console.log('moust over')
  }

  minimizeMenu () {
    const result = true
    this.toolbarUIService.updateBarSize(result)
    localStorage.setItem('barSize', String(result))
    this.updateScreenSize();
  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.tinyMenu = false
    this.gridtoggletiny = "grid-toggle-tiny"
    if (this.smallMenu) {
      this.tinyMenu = true
      this.gridtoggletiny = "grid-toggle-collapsed"
    }
  }

  initMenu() {

    this.initMenus();
    const user = this.authenticationService.userValue;
    this.user  = user;
    if (!user || !user.roles) { return}
    if (user.roles != 'admin') { return }
    const site       = this.siteService.getAssignedSite();
    const menuCheck$ = this.menusService.mainMenuExists(site);
    this.accordionMenu$ = menuCheck$.pipe(
      switchMap( data => {
          if (user?.roles === 'admin') {
            return  this.menusService.createMainMenu(user , site)
          }
          return  this.menusService.getMenuGroupByName(site, this.menuName)
        }
      )
    ).pipe(
      switchMap(data => {
        if (!data) { return of(null)}
        if (user.roles === 'admin' ) {
          if (!data) {  return of(null) }
          const menuGroup = data as MenuGroup;
          this.refreshMenuFromAccordion(menuGroup.accordionMenus)
          return of(data)
        }
        if (!data) {  return of(null) }
        this.refreshMenuFromAccordion(data)
        return of(data)
      }
    ))
  }

  refreshMenu(user: IUser) {
    this.initMenu();
    if (!user) {
      return;
    }
    const site  = this.siteService.getAssignedSite();
    const menu$ = this.menusService.getMenuGroupByName(site,  this.menuName)

    this.menu$ = menu$.pipe(
      switchMap(data => {
        if (!data) { return of(null) }
        this.config = this.mergeConfig(this.options);
        try {
          if (data.toString() === 'no menu') {
            if (this.user && this.user?.roles === 'admin') {
              this.siteService.notify('No Menu Found. Please do system check.', 'Alert', 2000)
            }
            return of(null)
          }
        } catch (error) {
        }
        if (data.length > 0) {
          try {
            data.filter( item => {
              this.addItemToMenu(item, this.menus)
            })
            this.menus =  [...new Set(this.menus)]
            if (this.menus) {
              this._toggle(this.menus[0], 0, true)
            }
          } catch (error) {
          }
        }
        return of(this.menus)
      }
    ))

    this._barSize = this.toolbarUIService.barSize$.subscribe( data => {
      this.smallMenu = data;
    })

  }

  refreshMenuFromAccordion(accordionMenu: any) {

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

  hideMenu() {
    this.toolbarUIService.updateToolBarSideBar(false)
  }

  navigateMenu(routerLink: string) {
    this.router.navigate([routerLink]);
    if (this.authenticationService?.deviceInfo?.phoneDevice) {
      // console.log('hide menu')
      this.hideMenu()
    }
  }

  toggle(menu: AccordionMenu, index: number) {
    this._toggle(menu, index, false)
  }

  _toggle(menu: AccordionMenu, index: number, toggleOn: boolean) {
    try {
      this.displayCategories = true
      this.index = index;
      if (!this.config.multi) {
        this.menus.filter(
          (menu, i) => i !== index && menu.active
        ).forEach(menu =>
          {
            if (menu && menu.active) {
              menu.active = !menu.active
            }
          });

      }

      if (this.menus && this.menus[index] && this.menus[index].active) {
        this.menus[index].active = !this.menus[index].active;
      }

      if (!this.menus[index]  || !this.menus[index].submenus) {
        return
      }
      this.submenu  = this.menus[index].submenus

      if (!toggleOn) {
        if (menu.routerLink) {
          this.routerNavigation(menu.routerLink)

          if (this.authenticationService?.deviceInfo?.phoneDevice && this.submenu.length == 0){
            this.hideMenu()
          }

        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  isAuthorized(userType: string): boolean {
    const result = this.userAuthorizationService.isUserAuthorized(userType);
    return result
  }

}

