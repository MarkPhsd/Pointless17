import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TriPOSMethodService } from 'src/app/_services/tripos/tri-posmethod.service';
@Component({
  selector: 'app-tripos-settings',
  templateUrl: './tripos-settings.component.html',
  styleUrls: ['./tripos-settings.component.scss']
})
export class TriposSettingsComponent implements OnInit {

  action$: Observable<any>;
  jsonData: any;
  inputForm: FormGroup
  @Input() laneID: number;
  
  constructor(private triposMethodService: TriPOSMethodService,
              private siteService: SitesService,
              private fb: FormBuilder) { }

  ngOnInit(): void {
    const i = 0
    this.inputForm = this.fb.group({
      laneID: [this.laneID],
      activationCode: [],
      marketCode: ['4'],
      terminalID: ['001'],
    })
  }

  clearJSON(){
    this.jsonData = undefined  }

  getLane() {
    console.log(this.laneID)
    // if (this.laneID) { 
      const laneID = this.laneID.toString();
      const site = this.siteService.getAssignedSite()
      this.action$ = this.triposMethodService.getLane(site , laneID).pipe(switchMap(data => {
        this.jsonData = data;
        return of(data  )
      }))
    // }
  }

  getLanes() { 
    const site = this.siteService.getAssignedSite()
    this.action$ = this.triposMethodService.getLanes(site).pipe(switchMap(data => {
      this.jsonData = data;
      return of(data  )
    }))
  }

  deleteLane() {
    const laneID = this.laneID.toString();
    const site = this.siteService.getAssignedSite()
    this.action$ = this.triposMethodService.deleteLane(site , laneID).pipe(switchMap(data => {
      this.jsonData = data;
      return of(data  )
    }))
  }

  updateLane() {

  }

  initializeLane() {
    const site = this.siteService.getAssignedSite()
    this.action$ = this.triposMethodService.initializeLane(site , this.inputForm.value).pipe(switchMap(data => {
      this.jsonData = data;
      return of(data  )
    }))
  }
}
