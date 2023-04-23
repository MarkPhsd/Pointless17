import { Component, QueryList,  ViewChildren,ChangeDetectorRef, ElementRef, TemplateRef, ViewChild, OnDestroy, AfterViewInit, ViewContainerRef, AfterContentInit } from '@angular/core';
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
import { AppInitService } from './_services/system/app-init.service';
import { Capacitor } from '@capacitor/core';
import { UISettingsService } from './_services/system/settings/uisettings.service';
import { InputTrackerService } from './_services/system/input-tracker.service';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
// import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';

LicenseManager.setLicenseKey('CompanyName=Coast To Coast Business Solutions,LicensedApplication=mark phillips,LicenseType=SingleApplication,LicensedConcurrentDeveloperCount=1,LicensedProductionInstancesCount=0,AssetReference=AG-013203,ExpiryDate=27_January_2022_[v2]_MTY0MzI0MTYwMDAwMA==9a56570f874eeebd37fa295a0c672df1');
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [ fadeInAnimation ],
})
export class AppComponent implements OnDestroy , AfterViewInit, AfterContentInit{
  
  @ViewChild('keyboardRef', { read: ElementRef }) keyboardRef: ElementRef;
  // @ViewChild('templateRef') templateRef: TemplateRef<any>;
  @ViewChild('keyboardView') keyboardView: TemplateRef<any>;

  keyboardPosition :any;// { x: number, y: number };


  get capPlatForm() {  return Capacitor.getPlatform(); }
  idleState = "NOT_STARTED";
  countdown?: number = null;
  lastPing?: Date = null;

  toggleTheme = new FormControl(false);
  user: IUser;
  _user: Subscription;
  _keyboardVisible: Subscription;
  keyboardVisible: boolean;
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;
  appUrl : string;
  container: string;
  keyboardDimensions = 'height:300px;width:700px'
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
      private platForm              : Platform,
      private router:                Router,
      private titleService          :Title,
      private authenticationService: AuthenticationService,
      private uiSettingsService: UISettingsService,
      private statusBar:             StatusBar,
      private cd: ChangeDetectorRef,
      private awsService:            AWSBucketService,
      private electronService      :  ElectronService,
      private appInitService       : AppInitService,
      private inputTrackerService: InputTrackerService,
      private viewContainerRef: ViewContainerRef
      // private ipcService          :  IPCService,
  ) {
      // this.deletePosition();
      this.initSubscription();
      this.initStyle();
      this.initializeApp();
      this.backButtonEvent();
      this.awsService.awsBucket();
      this.setTitle();
      this.devMode = isDevMode();
      // this.uiSettingsService.updateToggleKeyboard()
      if (this.electronService.isElectronApp && !this.devMode) {
        // this.AuthService.logout();
      }
      this.container = 'container-app'
      if (this.capPlatForm === 'web') { 
        this.container = 'container'
      }

      this.initKeyboardSubscriber()
  }

  ngAfterContentInit() {
    if (this.isKeyBoardVisible) { 
      this.viewContainerRef.createEmbeddedView(this.keyboardView);
    }
  }
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngAfterViewInit() {
    if (this.isKeyBoardVisible) { 
      this.initSavedKeyboardLocation()
    }
  }
  
  initKeyboardSubscriber() {
    this._keyboardVisible = this.uiSettingsService.toggleKeyboard$.subscribe(data => { 
      this.keyboardVisible = data; 
      if (data) {
        const keyboardDimensions = localStorage.getItem('keyboardDimensions')
        this.keyboardDimensions = 'height:500px;width:900px';
        // if (keyboardDimensions) { 
        //   const dimensions = JSON.parse(keyboardDimensions)
        //   const height = dimensions?.height;
        //   const width = dimensions?.width;
        //   this.keyboardDimensions = `height:${height}px;width:${width}px;`
        // }
        this.initSavedKeyboardLocation()
      }
    })
  }

  initSavedKeyboardLocation() { 
    if (!this.isKeyBoardVisible) {return}
    const savedPosition = localStorage.getItem('keyboardPosition');
    const position = JSON.parse(savedPosition)
    this.keyboardPosition = position 
    console.log('restored', position)
  }

  onResizeKeyboard(event) { 
    if (!event) {return}
    localStorage.setItem('keyboardDimensions', JSON.stringify(event))
  }

  onDragEnd(event: CdkDragEnd) {
    // save the end position
    const position = event.source.getFreeDragPosition();
    localStorage.setItem('keyboardPosition', JSON.stringify(position));
    console.log('position', position)
  }

  get isKeyBoardVisible() { 
    if (this.keyboardVisible) {
      return this.keyboardView
    } 
    return null;
  }

  ngOnDestroy() { 
    if (this._keyboardVisible) { 
      this._keyboardVisible.unsubscribe()
    }
  }


  toggleDrag() { 
    // this.toggleDrag
  }

  initializeApp() {
    this.appUrl = this.appInitService.apiBaseUrl()
  }

  initStyle() {
    try {
      this.platForm.ready().then(() => {
        this.statusBar.styleLightContent();
      });
    } catch (error) {

    }
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


  logout() {
    this.authenticationService.logout();
  }

  backButtonEvent() {
    this.platForm.backButton.subscribe(outlet => {
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

