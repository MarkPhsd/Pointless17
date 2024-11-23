import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule, MatLegacyLabel } from '@angular/material/legacy-form-field';
import { of, switchMap,Observable } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SystemService } from 'src/app/_services/system/system.service';

@Component({
  selector: 'app-set-token',
  standalone: true,
  imports: [CommonModule,FormsModule,MatLegacyButtonModule,MatLegacyFormFieldModule,MatIconModule],
  templateUrl: './set-token.component.html',
  styleUrls: ['./set-token.component.scss']
})
export class SetTokenComponent implements OnInit {
  pinToken        : string;
  action$: Observable<any>;

  constructor(
    private siteService: SitesService,
    private systemService: SystemService,) { }

  ngOnInit(): void {
  }

  setAPIToken() {
    if (!this.pinToken) {this.pinToken = ''}
    localStorage.setItem('pinToken', this.pinToken);
    console.log(localStorage.getItem('pinToken'))
  }

  clearTokenDevice() {
    localStorage.removeItem('devicename')
    localStorage.removeItem('pinToken')
  }
  getToken() {
    const site = this.siteService.getAssignedSite()
    this.action$ = this.systemService.getToken(site).pipe(switchMap(data => {
      if (data) {
        localStorage.setItem('pinToken', data);
        this.siteService.notify('Token Assigned', 'close', 3000)
      }
      if (!data) {
        this.siteService.notify('Token Server Disabled', 'close', 3000)
      }
      return of(data)
    }))

    }
}

