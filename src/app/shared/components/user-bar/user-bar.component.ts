import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { switchMap, Observable, of, catchError  } from 'rxjs';
import { AuthenticationService } from 'src/app/_services';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MenusService } from 'src/app/_services/system/menus.service';
import { AccordionMenu, IClientTable, ISite, IUser, MenuGroup, SubMenu } from 'src/app/_interfaces';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { AWSBucketService } from 'src/app/_services';
import { SiteFooterComponent } from '../site-footer/site-footer.component';
import { ToggleThemeComponent } from '../../widgets/toggle-theme/toggle-theme.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { RequestMessageComponent } from 'src/app/modules/admin/profiles/request-messages/request-message/request-message.component';
import { MenuTinyComponent } from '../../widgets/menus/menu-tiny/menu-tiny.component';
import { RequestMessagesComponent } from 'src/app/modules/admin/profiles/request-messages/request-messages.component';
import { LogoComponent } from '../../widgets/logo/logo.component';
@Component({
  selector: 'user-bar',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SiteFooterComponent,
    MenuTinyComponent,RequestMessagesComponent,LogoComponent,
    ToggleThemeComponent,RequestMessageComponent],
  templateUrl: './user-bar.component.html',
  styleUrls: ['./user-bar.component.scss']
})
export class UserBarComponent implements OnInit {
  customerMenu = 'customer'
  user$ : Observable<any>;
  user  : IUser;
  currentMenu   : MenuGroup;
  accordionMenus: AccordionMenu[];
  mailCount  = 0;
  client: IClientTable;
  smallDevice;
  bucketName: string;

  site: ISite;

  constructor(
    private navigationService   : NavigationService,
    private siteService         : SitesService,
    private menusService: MenusService,
    private clientService: ClientTableService,
    private userSwitchingService: UserSwitchingService,
    private awsBucketService: AWSBucketService,
    private authenticationService: AuthenticationService) { }

  async ngOnInit() {
    this.bucketName =  await this.awsBucketService.awsBucket();
    const siteAss = this.siteService.getAssignedSite()
    this.site = siteAss;
    this.siteService.getSite(siteAss.id).subscribe(data => {
      this.site = data;
    })

    this.user$ = this.authenticationService.user$.pipe(
      switchMap(data => {
          // console.log('userbar update user', data)
          this.user = data
          if (!data) {
            return of (null)
          }
          return this.clientService.getClient(this.site, this.user?.id)
      })).pipe(switchMap(data => {
          this.client = data;
          return of(data)
      }),catchError(data => {
        // console.log('error getting client', data)
        return of(data)
      }))
    this.getMenuGroup('customer');

    if (window.innerWidth > 811) {
      this.smallDevice = false;
      this.siteService.smallDevice = false
    } else {
      this.smallDevice = true;
      this.siteService.smallDevice = true
    }
  }

  navPOSOrders() {
    this.navigationService.navPOSOrders()
  }

  navProfile() {
    this.navigationService.navProfile()
  }

  logOut() {
    this.userSwitchingService.clearLoggedInUser();
  }

  emailMailCount(event) {
    this.mailCount = event
  }

  getMenuGroup(name: string) {
    const site  =  this.siteService.getAssignedSite();
    if (!this.user) {return}
    const menu$ = this.menusService.getMainMenuByName(site, name);
    const accordionMenu$ = menu$.pipe(
      switchMap(data => {
        this.currentMenu = data;
        return this.menusService.getMenuGroupByNameForEdit(site, name);
      }
    )).pipe(switchMap(data => {
      this.accordionMenus = data
      return of(data)
    }));
    return accordionMenu$
  }

}
