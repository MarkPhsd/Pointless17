import { Component, OnInit, Input, OnDestroy, AfterViewInit } from '@angular/core';
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
    this._user = this.authenticationService.user$.pipe(
      switchMap(
        user => {
            if (!user) {
              this.menus = [] as AccordionMenu[];
              return EMPTY
            }
            return  this.menusService.getMainMenu(this.site, user)
          }
        )
      ).subscribe( data => {
        this.menus = [] as AccordionMenu[];
        if (!data) {
           return
        }
        this.config = this.mergeConfig(this.options);
        if (data)
          data.filter( item => {
            if (item.active) {this.menus.push(item) } //= data
          })
        }, err => {
          this.menus = [] as AccordionMenu[];
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

  async ngOnInit() {

    const site  = this.siteService.getAssignedSite();
    const result = await this.menusService.mainMenuExists(site).pipe().toPromise();
    console.log('ngOninit Result mainmenu exists', result)

    if (!result) {
      this.initMenu();
    }

    if (result) {
      this.initSubscription()
    }

  }

  initMenu() {
    const site  = this.siteService.getAssignedSite();
    // console.log('ngOninit Result mainmenu exists', )

    const menuCheck$ = this.menusService.mainMenuExists(site);
    menuCheck$.pipe(
      switchMap( data => {
        if (!data || data != true) {

          const user = this.authenticationService.userValue
          // console.log('init menu, getting user', user)

          if (user) {
            return  this.menusService.createMainMenu(user , site)
          }
          return EMPTY;
        }
      })
    ).subscribe(data => {
      if (!data)  {
        // console.log('menu did not initialize')
      }
      this.initSubscription()
      // console.log('menu created.')
    })

  }

  ngOnDestroy() {
    if (this._user) { this._user.unsubscribe() }
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

