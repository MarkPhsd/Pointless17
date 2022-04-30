import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { InventoryManifest, ManifestInventoryService } from 'src/app/_services/inventory/manifest-inventory.service';

@Component({
  selector: 'app-manifest-editor-header',
  templateUrl: './manifest-editor-header.component.html',
  styleUrls: ['./manifest-editor-header.component.scss']
})
export class ManifestEditorHeaderComponent implements OnInit {

  @Input() inputForm         : FormGroup;
  currentManifest   : InventoryManifest;
  currentManifest$  : Subscription;

  manifestID: number;
  site: ISite;

  currentManifestSite$  : Subscription;

  initSubscriptions() {

    try {
      this.currentManifest$ = this.manifestService.currentInventoryManifest$.subscribe(data => {
        this.currentManifest = data;
        this.manifestID = data.id;
      })
      this.initForm();
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
    private manifestService: ManifestInventoryService,
    private dialogRef: MatDialogRef<ManifestEditorHeaderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    const i = 0
    this.initSubscriptions();
  }

  updateItem(event) {

  }
  updateItemExit(event) {

  }

  deleteItem(event) {
    if (!this.site && this.manifestID == 0 ) { return }
    this.manifestService.delete(this.site, this.manifestID).subscribe(data => {
      this.dialogRef.close();
    })
  }

  onCancel(event) {
    this.dialogRef.close();
  }
  // (outputeupdateItem)     ="updateItem($event)"
  // (outputupdateItemExit)  ="updateItemExit($event)"
  // (outputupdatedeleteItem)="deleteItem($event)"
  // (outputupdateonCancel)  ="onCancel($event)"

  initForm() {
    this.inputForm = this.fb.group({
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
    })
    if (this.currentManifest) {
      this.inputForm.patchValue(this.currentManifest)
    }



  }

  dispatchSendToSite(){

  }

  cancelRequestDispatchSendToSite(){

  }

  reviewDeliveredInventoryStatus(){

  }

  acceptRejectedInventory(){

  }

  receiveAll(){

  }

  receiveSelected(){

  }

  rejectManifest(){

  }

  assignToInventoryLocation(){

  }


}
