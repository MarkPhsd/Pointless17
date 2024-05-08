import { Component, OnInit, Input, OnDestroy, HostListener } from '@angular/core';
import { AccordionMenu, accordionConfig, SubMenu, IUser, ISite } from 'src/app/_interfaces/index';
import { EMPTY, Observable, of, Subscription, } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';
import { transition, animate, style, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AuthenticationService } from 'src/app/_services';
import { switchMap } from 'rxjs/operators';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';

@Component({
  selector: 'app-menu-minimal',
  templateUrl: './menu-minimal.component.html',
  styleUrls: ['./menu-minimal.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({opacity: 0}),
        animate(300, style({opacity: 1}))
      ]),
      transition('* => void', [
        animate(300, style({opacity: 0}))
      ])
    ])
  ]
})

export class MenuMinimalComponent implements OnInit, OnDestroy {
  gridtoggletiny:    string;
  accordionMenu$:    Observable<AccordionMenu[]>;
  @Input()           options;
  @Input() menus:    AccordionMenu[];
  submenu:           SubMenu[];
  config:            accordionConfig;
  displayCategories: boolean;
  index:             number;
  result:            boolean;

  user              : IUser;
  _user             : Subscription;
  site              : ISite;
  isStaff: boolean;
  tinyMenu : boolean;
  smallMenu : boolean;
  _barSize: Subscription
  barSize: boolean;
  menus$ : Observable<AccordionMenu[]>;

  isAuthorized(userType: string): boolean {
    // console.log('userType', userType)
    return this.userAuthorizationService.isUserAuthorized(userType)
  }

  initSubscription() {
    this._user = this.authenticationService.user$.subscribe(user => {
        this.user = user
        if (!user || !user.roles) {
          this.menus = [] as AccordionMenu[];
          return
        }
        this.user = user;
        this.refreshMenu(user)
      }
    )
    this._barSize = this.toolbarUIService.barSize$.subscribe( data => {
      this.smallMenu = data;
    })
  }

  setSmallMenu() {
    const result = !this.smallMenu
    this.toolbarUIService.updateBarSize(result)
    localStorage.setItem('barSize', String(result))
    this.updateScreenSize();
  }

  refreshMenu(user: IUser) {

    this.initMenu();

    if (!user || !user.roles) {
      return
    }
    const site  = this.siteService.getAssignedSite();
    const menu$ = this.menusService.getMenuGroupByName(site, 'main')

    this.menus$ = menu$.pipe(
      switchMap(data => {

        if (!data) { return of(null) }
        this.config = this.mergeConfig(this.options);
        if (data)

        try {
          if (data.toString() === 'no menu') {
            if (this.user && this.user?.roles === 'admin') {
              this.siteService.notify('No Menu Found. Please do system check.', 'Alert', 2000)
            }
            return of(null)
          }
        } catch (error) { }


        try {
          data.filter( item => {
            this.addItemToMenu(item, this.menus)
          })
          this.menus =  [...new Set(this.menus)]

          if (this.menus) {
            // this.toggle(this.menus[0], 0)
          }

        } catch (error) {
        }

        return of(this.menus)
      }
    ))

    this._barSize = this.toolbarUIService.barSize$.subscribe( data => {
      this.smallMenu = data;
    })

  }

  addItemToMenu(item: AccordionMenu, mainMenu: AccordionMenu[]) {
    if (!mainMenu && item) { return }
    if (item.active) {mainMenu.push(item) }
    this.menus =  [...new Set(mainMenu)]
  }

  constructor ( private menusService            : MenusService,
                private router                  : Router,
                private siteService             : SitesService,
                private authenticationService   : AuthenticationService,
                private userSwichingService:    UserSwitchingService,
                private toolbarUIService        : ToolBarUIService,
                private userAuthorizationService: UserAuthorizationService,
              ) {
    this.site  =  this.siteService.getAssignedSite();
  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.tinyMenu = false
    this.gridtoggletiny = "grid-toggle-tiny"
    if ( this.smallMenu) {
      this.tinyMenu = true
      this.gridtoggletiny = "grid-toggle-collapsed"
    }
  }

  ngOnInit() {
    this.isStaff = this.userAuthorizationService.isUserAuthorized('employee,manager,admin')
    if (this.isStaff) {
      this.initMenu()
      this.initSubscription()
    }
  }

  ngOnDestroy() {
    if (this._user) { this._user.unsubscribe() }
    this.initMenus()
  }

  initMenus() {
    this.menus   = [] as AccordionMenu[];
    this.submenu = [] as SubMenu[];
  }

  initMenu() {
    this.initMenus()
    const site       = this.siteService.getAssignedSite();

    if (!this.user || !this.user?.roles) {return}
    if (!this.user.roles) {return};

    const menuCheck$ = this.menusService.mainMenuExists(site);
    menuCheck$.pipe(
      switchMap( data => {
        if (!data || !data.result) {
           if (this.user) {
            return  this.menusService.createMainMenu(this.user , site)
          }
          return EMPTY;
        }
      })
    ).pipe(
      switchMap(data => {
        this.refreshMenu(this.user)
        return of(data)
      }
    ))
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
      console.log('hide menu')
      this.hideMenu()
    }
    // if (this.tinyMenu) {
    // }
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
        if (this.authenticationService?.deviceInfo?.phoneDevice && this.submenu.length == 0){
          this.hideMenu()
        }
      }

    } catch (error) {
      console.log(error)
    }
  }

}
