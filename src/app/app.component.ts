import { Component, QueryList,  ViewChildren,ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthenticationService, AWSBucketService, DevService } from './_services';
import { IUser }  from 'src/app/_interfaces';
import { fadeInAnimation } from './_animations';
import { FormControl } from '@angular/forms';
import { Platform, IonRouterOutlet, ToastController } from '@ionic/angular';
import { LicenseManager} from "ag-grid-enterprise";
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { ElectronService } from 'ngx-electron';
import { isDevMode } from '@angular/core';
// import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';

LicenseManager.setLicenseKey('CompanyName=Coast To Coast Business Solutions,LicensedApplication=mark phillips,LicenseType=SingleApplication,LicensedConcurrentDeveloperCount=1,LicensedProductionInstancesCount=0,AssetReference=AG-013203,ExpiryDate=27_January_2022_[v2]_MTY0MzI0MTYwMDAwMA==9a56570f874eeebd37fa295a0c672df1');
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [ fadeInAnimation ],
})
export class AppComponent {

  idleState = "NOT_STARTED";
  countdown?: number = null;
  lastPing?: Date = null;

  toggleTheme = new FormControl(false);
  user: IUser;
  _user: Subscription;

  lastTimeBackPress = 0;
  timePeriodToExit = 2000;

  devMode = false;
  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

  initSubscription() {
    try {
      if (this.authenticationService.userValue) {
        this.user = this.authenticationService.userValue;
      }
      this._user = this.authenticationService.user$.subscribe( data => {
        this.user  = data
      })
    } catch (error) {

    }
  }

  // private idle: Idle,
  constructor(
      private platform:              Platform,
      private router:                Router,
      private titleService          :Title,
      private authenticationService: AuthenticationService,
      private statusBar:             StatusBar,
      private cd: ChangeDetectorRef,
      private awsService:            AWSBucketService,
      private electronService      :  ElectronService,
      // private ipcService          :  IPCService,

  ) {

      this.initSubscription();
      this.initializeApp();
      this.backButtonEvent();
      this.awsService.awsBucket();
      this.setTitle();
      this.devMode = isDevMode();
      if (this.electronService.isElectronApp && !this.devMode) {
        // this.AuthService.logout();
      }
      // console.log('is Electron Service', ipcService.isElectronApp)
      // if (ipcService.isElectronApp) {
      //   console.log(process.env);
      //   console.log('Run in electron');
      //   console.log('Electron ipcRenderer', this.ipcService.ipcRenderer);
      //   console.log('NodeJS childProcess', this.ipcService.childProcess);
      // }

  }

  // initIdleTracking() {
  //   this.idle.setIdle(5); // how long can they be inactive before considered idle, in seconds
  //   this.idle.setTimeout(5); // how long can they be idle before considered timed out, in seconds
  //   this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES); // provide sources that will "interrupt" aka provide events indicating the user is active

  //   // do something when the user becomes idle
  //   this.idle.onIdleStart.subscribe(() => {
  //     this.idleState = "IDLE";
  //   });
  //   // do something when the user is no longer idle
  //   this.idle.onIdleEnd.subscribe(() => {
  //     this.idleState = "NOT_IDLE";
  //     console.log(`${this.idleState} ${new Date()}`)
  //     this.countdown = null;
  //     this.cd.detectChanges(); // how do i avoid this kludge?
  //   });
  //   // do something when the user has timed out
  //   this.idle.onTimeout.subscribe(() => {
  //     // this.logOut();
  //   } );
  //   // do something as the timeout countdown does its thing
  //   this.idle.onTimeoutWarning.subscribe(seconds => {
  //     this.countdown = seconds
  //   });

  //   // set keepalive parameters, omit if not using keepalive
  //   // keepalive.interval(15); // will ping at this interval while not idle, in seconds
  //   // keepalive.onPing.subscribe(() => this.lastPing = new Date()); // do something when it pings
  // }


  setTitle() {
    const appTitle = this.titleService.getTitle();
    try {
      this.router.events.subscribe(event => {
        if(event instanceof NavigationEnd) {
          const title = this.getTitle( this.router.routerState, this.router.routerState.root).join('-');
          if (!title) {
            this.titleService.setTitle('Pointless POS');
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
    try {
      this.platform.ready().then(() => {
        this.statusBar.styleLightContent();
      });
    } catch (error) {

    }
  }

  logout() {
    this.authenticationService.logout();
  }

  backButtonEvent() {
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
            // const toast = await this.toastController.create({
            //   message: 'Press back again to exit App.',
            //   duration: 2000,
            //   position: 'middle'
            // });
            // toast.present();
            this.lastTimeBackPress = new Date().getTime();
          }
        }
      });
    });
  }

}

