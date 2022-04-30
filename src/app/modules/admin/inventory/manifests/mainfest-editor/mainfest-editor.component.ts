import { Component, OnInit,OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { InventoryManifest, ManifestInventoryService } from 'src/app/_services/inventory/manifest-inventory.service';

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

  initSubscriptions() {

    try {
      this.currentManifest$ = this.manifestService.currentInventoryManifest$.subscribe(data => {
        this.currentManifest = data;
        this.manifestID = data.id;
        this.inventoryItems = this.currentManifest.inventoryAssignments;
        this.inputForm.patchValue(this.currentManifest)
      })
    } catch (error) {
      console.log('subscription error manifest', error)
    }

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
