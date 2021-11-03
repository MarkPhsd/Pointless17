import { Component, OnInit, Input, OnChanges,OnDestroy } from '@angular/core';
import { AccordionMenu, accordionConfig, SubMenu, IUserProfile, IUser } from 'src/app/_interfaces/index';
import { Observable, Subscription, } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';
import { transition, animate, style, trigger } from '@angular/animations';
import { SystemService } from 'src/app/_services/system/system.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { AuthenticationService } from 'src/app/_services';

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


  initSubscription() {

    this._user = this.authenticationService.user$.subscribe( data => {
      this.user  = data
      this.getMenu();
    })

  }

  constructor ( private menusService            : MenusService,
                private userAuthorizationService: UserAuthorizationService,
                private router                  : Router,
                private siteService             : SitesService,
                private authenticationService   : AuthenticationService,
              ) {}

  async ngOnInit() {
    this.initSubscription();
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._user) {
      this._user.unsubscribe()
    }
  }

  async getMenu() {
    if (!this.user) {
      // console.log('No User Assigned')
      return;
    }
    // console.log('getmenu', this.user)/

    const site  =  this.siteService.getAssignedSite();
    this.config = this.mergeConfig(this.options);
    this.accordionMenu$ =  this.menusService.getMainMenu(site)

    this.accordionMenu$.subscribe(data=>{
      // console.log(data, this.user.roles)
      this.menus = [] as AccordionMenu[];
      data.filter( item => {
        if (item.active) {
          this.menus.push(item)  //= data
        }
      })
    }, err => {
      // console.log('err', err)
    })
    this.displayCategories = false;
  }

  async initMenu() {
    if (!this.user) {
      // console.log('No User Assigned')
      return;
    }
    const site  = this.siteService.getAssignedSite();
    try {
      this.menusService.createMainMenu(site).subscribe(data => console.log(data))
    } catch (error) {
      // console.log('error', error)
    }
  }

  toggleDelayHide() {

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
    // if (!menu.active) {return false}
    // console.log('isAuthorized from menu minimal')
    return this.userAuthorizationService.isUserAuthorized(menu.userType)
  }


}
