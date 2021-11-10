import { Component, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthenticationService, AWSBucketService, MenuService } from './_services';
import { IUser }  from 'src/app/_interfaces';
import { fadeInAnimation, slideInOutAnimation } from './_animations';
import { FormControl } from '@angular/forms';
import { Platform, IonRouterOutlet, ToastController } from '@ionic/angular';
import { LicenseManager} from "ag-grid-enterprise";
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ElectronService } from 'ngx-electron';
import { SitesService } from './_services/reporting/sites.service';
import { MenusService } from './_services/system/menus.service';
import { Subscription } from 'rxjs';
LicenseManager.setLicenseKey('CompanyName=Coast To Coast Business Solutions,LicensedApplication=mark phillips,LicenseType=SingleApplication,LicensedConcurrentDeveloperCount=1,LicensedProductionInstancesCount=0,AssetReference=AG-013203,ExpiryDate=27_January_2022_[v2]_MTY0MzI0MTYwMDAwMA==9a56570f874eeebd37fa295a0c672df1');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [ fadeInAnimation ],
})
export class AppComponent {

  title = 'CCS Dashboard';
  toggleTheme = new FormControl(false);
  user: IUser;
  _user: Subscription;

  lastTimeBackPress = 0;
  timePeriodToExit = 2000;

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

  initSubscription() {

    // console.log('init menu minimal')
    if (this.authenticationService.userValue) {
      this.user = this.authenticationService.userValue;
    }

    this._user = this.authenticationService.user$.subscribe( data => {
      this.user  = data
    })

  }

  constructor(
      private platform:              Platform,
      private router:                Router,
      private authenticationService: AuthenticationService,
      private statusBar:             StatusBar,
      private toastController:       ToastController,
      private awsService:            AWSBucketService,
      private electronService:       ElectronService,
      private siteService         :  SitesService,
      private menusService        :  MenusService,

  ) {

      // this.user = this.authenticationService.userValue
      this.initSubscription();

      this.initializeApp();
      // Initialize BackButton Eevent.
      this.backButtonEvent();
      //aws settings
      this.awsService.awsBucket();

      if (this.electronService.isElectronApp) {
        // this.electronService.ipcRenderer.on('trigger-alert');
      }
      this.initMenu();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
    });
  }

  initMenu() {
    const site  = this.siteService.getAssignedSite();
    if (this.user) {
      this.menusService.createMainMenu(site).subscribe(data => {
        }
      )
    }
  }

  logout() {
    this.authenticationService.logout();
  }

  // active hardware back button
  backButtonEvent() {
    // console.log("backButtonEvent Initialized")
    this.platform.backButton.subscribe(outlet => {
      this.routerOutlets.forEach(async (outlet: IonRouterOutlet) => {
        // console.log(outlet.getLastUrl)
        if (outlet && outlet.canGoBack()) {
          outlet.pop();

        } else if (this.router.url === '/home') {
          if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
            // this.platform.exitApp(); // Exit from app
            navigator['app'].exitApp(); // work in ionic 4

          } else {
            const toast = await this.toastController.create({
              message: 'Press back again to exit App.',
              duration: 2000,
              position: 'middle'
            });
            toast.present();
            // console.log(JSON.stringify(toast));
            this.lastTimeBackPress = new Date().getTime();
          }
        }
      });
    });
  }

}

