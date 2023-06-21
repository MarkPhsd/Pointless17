import { Component, OnInit, Input, OnDestroy, HostListener } from '@angular/core';
import { AccordionMenu, accordionConfig, SubMenu, IUser, ISite } from 'src/app/_interfaces/index';
import { EMPTY, Observable, Subscription, } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AuthenticationService } from 'src/app/_services';
import { switchMap } from 'rxjs/operators';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';

@Component({
  selector: 'app-menu-compact',
  templateUrl: './menu-compact.component.html',
  styleUrls: ['./menu-compact.component.scss'],
})

export class MenuCompactComponent implements OnInit, OnDestroy {

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

  tinyMenu  : boolean;
  smallMenu : boolean;

  _barSize: Subscription
  barSize: boolean;
  err: any;
  initSubscription() {
    this._user = this.authenticationService.user$.pipe(
      switchMap(
        user => {
            console.log('iniit menu subscription')
            if (!user) {
              this.menus = [] as AccordionMenu[];
              console.log('empty results')
              return EMPTY
            }
            return  this.menusService.getMenuGroupByName(this.site, 'main')
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
          console.log(err)
          this.menus = [] as AccordionMenu[];
      }
    )

    this._barSize = this.toolbarUIService.barSize$.subscribe( data => {
      this.smallMenu = data;
    })
  }


  constructor ( private menusService            : MenusService,
                private userAuthorizationService: UserAuthorizationService,
                private router                  : Router,
                private siteService             : SitesService,
                private authenticationService   : AuthenticationService,
                private toolbarUIService        : ToolBarUIService,
              ) {this.site  =  this.siteService.getAssignedSite();}

  async ngOnInit() {

    console.log('result from ngOninit menu Compact ')
    const site  = this.siteService.getAssignedSite();
    this.menusService.mainMenuExists(site).subscribe( result => {
      console.log(result)
      if (result) {
        this.initSubscription()
      }
    }, err => {
      console.log('error getting main menu', err)
      this.err = err
    });

  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.tinyMenu = false
    if (window.innerWidth < 599 || this.smallMenu) {
      this.tinyMenu = true
    }
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
