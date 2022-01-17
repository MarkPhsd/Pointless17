import { Component, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute,RouterOutlet } from '@angular/router';
import { AuthenticationService, AWSBucketService } from './_services';
import { IUser }  from 'src/app/_interfaces';
import { fadeInAnimation } from './_animations';
import { FormControl } from '@angular/forms';
import { Platform, IonRouterOutlet, ToastController } from '@ionic/angular';
import { LicenseManager} from "ag-grid-enterprise";
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';

LicenseManager.setLicenseKey('CompanyName=Coast To Coast Business Solutions,LicensedApplication=mark phillips,LicenseType=SingleApplication,LicensedConcurrentDeveloperCount=1,LicensedProductionInstancesCount=0,AssetReference=AG-013203,ExpiryDate=27_January_2022_[v2]_MTY0MzI0MTYwMDAwMA==9a56570f874eeebd37fa295a0c672df1');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [ fadeInAnimation ],
})
export class AppComponent {

  // title = 'CCS Dashboard';
  toggleTheme = new FormControl(false);
  user: IUser;
  _user: Subscription;

  lastTimeBackPress = 0;
  timePeriodToExit = 2000;

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

  initSubscription() {
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
      private titleService          :Title,
      private activatedRoute        :ActivatedRoute,
      private authenticationService: AuthenticationService,
      private statusBar:             StatusBar,
      private toastController:       ToastController,
      private awsService:            AWSBucketService,

  ) {
      this.initSubscription();

      this.initializeApp();
      // Initialize BackButton Event.
      this.backButtonEvent();

      //aws settings
      this.awsService.awsBucket();
      this.setTitle();
  }

  setTitle() {
    const appTitle = this.titleService.getTitle();

    // this.router
    //   .events.pipe(
    //     filter(event => event instanceof NavigationEnd),
    //     map( outPut => {
    //       console.log('outPut ', outPut);
    //       if (this.activatedRoute.firstChild) {
    //         const child = this.activatedRoute.firstChild;
    //         const data = child.snapshot.data;
    //         if (child && data && data.title)
    //         {
    //           console.log('rout data', data)
    //           return appTitle;
    //         }
    //       }
    //     })
    //   ).subscribe( pageTitle => {
    //     this.titleService.setTitle(pageTitle);
    //   });
    try {
      this.router.events.subscribe(event => {
        if(event instanceof NavigationEnd) {
          const title = this.getTitle( this.router.routerState, this.router.routerState.root).join('-');
          // console.log('title', title)
          if (!title) {
            this.titleService.setTitle('Pointless');
            return
          }
          this.titleService.setTitle(title);
        }
      });
    } catch (error) {

    }
  }

  getTitle(state, parent) {
    var data = [];
    if(parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }

    if(state && parent) {
      data.push(... this.getTitle(state, state.firstChild(parent)));
    }
    return data;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
    });
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

