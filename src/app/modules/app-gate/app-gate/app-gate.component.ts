import { Component, OnInit, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AppInitService } from 'src/app/_services/system/app-init.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-app-gate',
  standalone: true,
  imports: [CommonModule,MatLegacyButtonModule, MatIconModule],
  templateUrl: './app-gate.component.html',
  styleUrls: ['./app-gate.component.scss']
})
export class AppGateComponent implements OnInit , OnChanges{

  logo          : string;
  company       : string;
  entryQuestion : string;
  rememberChoice: boolean;
  useAppGate    : boolean;
  apiUrl        : any;

  constructor(private router        : Router,
              private appInitService: AppInitService,
              public platFormService: PlatformService,
        ) { }

  async ngOnInit() {
    this.apiUrl = this.appInitService.getLocalApiUrl()
    await this.appInitService.init();
    this.apiUrl         = this.appInitService.apiBaseUrl();
    this.useAppGate     = this.appInitService.appGateEnabled();
    this.entryQuestion  = this.appInitService.appGateMessage();
    if (!this.useAppGate)  {
      this.router.navigateByUrl('/login')
      return
    }
    await this.navRefresh()
  }

  initLogo() {
    const logo        = this.appInitService.logo;
    if (logo)  {
      this.logo   = logo
    }
  }

  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (!this.useAppGate)  {  this.router.navigateByUrl('/login')}
  }

  leaveSite() {
    console.log('')
  }

  async navRefresh() {

    this.company  = '';
    if (!this.platFormService.webMode ) {
      this.skipCheck();
      return
    }
    this.logo     = `${environment.logo}`
    this.company  = `${environment.company}`
    if (!this.useAppGate) {
      this.router.navigateByUrl('/login')
    }
  }

  enterSite() {
    this.saveChoice()
    this.router.navigateByUrl('/login')
  }

  skipCheck() {
    localStorage.setItem("ami21", 'true')
    this.router.navigateByUrl('/login')
  }

  saveChoice() {
    if (!this.rememberChoice) {
      localStorage.setItem("ami21", 'true')
    } else {
      localStorage.removeItem('ami21')
    }
    console.log(localStorage.getItem("ami21"))
  }


}
