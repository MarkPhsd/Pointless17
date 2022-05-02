import { T } from '@angular/cdk/keycodes';
import { Component, OnInit,OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { InventoryManifest, ManifestInventoryService } from 'src/app/_services/inventory/manifest-inventory.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-mainfest-editor',
  templateUrl: './mainfest-editor.component.html',
  styleUrls: ['./mainfest-editor.component.scss']
})
export class MainfestEditorComponent implements OnInit,OnDestroy {

  inputForm         : FormGroup;
  currentManifest   : InventoryManifest;
  currentManifest$  : Subscription;
  inventoryItems: IInventoryAssignment[];
  manifestID: number;
  site: ISite;

  currentManifestSite$  : Subscription;

  sendDate:           string;
  scheduleDate:       string;
  acceptedDate:       string;

  sites$
  type$
  status$

  initManifestSubscriber() {
    try {
      this.currentManifest$ = this.manifestService.currentInventoryManifest$.subscribe(data => {
       if (data) {
         this.currentManifest = data;
         this.manifestID = data.id;
         this.inventoryItems = this.currentManifest.inventoryAssignments;
         this.inputForm.patchValue(this.currentManifest)
         return
      }
        this.currentManifest = null;
         this.manifestID = 0;
         this.inventoryItems = null;
      })
    } catch (error) {
      console.log('subscription error manifest', error)
    }
  }
  initSubscriptions() {

    this.initManifestSubscriber()

    try {
      this.currentManifestSite$ = this.manifestService.currentManifestSite$.subscribe(data => {
        this.site = data;
      })
    } catch (error) {
      console.log('subscription error manifest', error)
    }

  }

  constructor(
    private fb: FormBuilder,
    private siteService:SitesService,
    private dialogRef: MatDialogRef<MainfestEditorComponent>,
    private manifestService: ManifestInventoryService) { }

  ngOnInit(): void {
    const i = 0;
    this.initForm()
    this.initSubscriptions()
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.currentManifest$) { this.currentManifest$.unsubscribe()}
    if (this.currentManifestSite$) {
      this.manifestService.updateSelectedManifestSite(null)
      this.currentManifestSite$.unsubscribe()
    }

  }

  applyType(event) {

  }

  applyStatus(event) {

  }

  applySite(event) {

  }

  saveManifest(event) {

    //const site = this.site
    const site = this.siteService.getAssignedSite()
    if (!site) { return }

    console.log('save manifest', this.currentManifest)

    if (!this.currentManifest) { return }

    const manifest  = this.inputForm.value as InventoryManifest;
    console.log('manifest', manifest)

    const manifest$ = this.manifestService.update(site, this.currentManifest.id, manifest )
    manifest$.subscribe(data => {
      console.log('result ', data)

      this.manifestService.updateCurrentInventoryManifest(data)
      if (event) {
        this.dialogRef.close();
      }
    })
  }

  deleteManifest(event) {
    const site = this.site
    const warn = window.confirm('Are you sure you want to delete this?')
    if (!warn) { return }

    if (!this.currentManifest) { return }
    const manifest$ = this.manifestService.update(site, this.currentManifest.id, this.currentManifest )
    manifest$.subscribe(data => {
      // this.manifestService.updateCurrentInventoryManifest(data)
      this.dialogRef.close()
    })

  }

  initForm(){
    this.inputForm = this.fb.group({
      id:                 [],
      name:               [],
      originatorID:       [],
      sourceSiteID:       [],
      sourceSiteURL:      [],
      receiverManifestID: [],
      desinationID:       [],
      desinationURL:      [],
      active:             [],
      status:             [],
      type:               [],
      entryUser:          [],
      entryUserID:        [],
      requestedBy:        [],
      requestedByID:      [],
      createdDate:        [],
      sendDate:           [],
      receiverName:       [],
      scheduleDate:       [],
      carrierName:        [],
      carrierEmployee:    [],
      acceptedDate:       [],
      description:        [],
      recieverID:         [],
      statusID:           [],
      typeID:             [],
      // inventoryAssignments:any[];
      // manifestTypes	      :any;
      // manifestStatus	    :any;
      // site                :any;
    })
    return this.inputForm
  }
}
