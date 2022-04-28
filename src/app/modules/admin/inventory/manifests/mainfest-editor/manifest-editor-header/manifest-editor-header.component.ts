import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { InventoryManifest, ManifestInventoryService } from 'src/app/_services/inventory/manifest-inventory.service';

@Component({
  selector: 'app-manifest-editor-header',
  templateUrl: './manifest-editor-header.component.html',
  styleUrls: ['./manifest-editor-header.component.scss']
})
export class ManifestEditorHeaderComponent implements OnInit {

  inputForm         : FormGroup;
  currentManifest   : InventoryManifest;
  currentManifest$  : Subscription;

  initSubscriptions() {
    this.currentManifest$ = this.manifestService.currentInventoryManifest$.subscribe(data => {
      this.currentManifest = data;
    })
  }

  constructor(
    private fb: FormBuilder,
    private manifestService: ManifestInventoryService) { }

  ngOnInit(): void {
    const i = 0
    this.initSubscriptions();
  }

  updateItem(event) {

  }
  updateItemExit(event) {

  }
  deleteItem(event) {

  }
  onCancel(event) {

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
