import { C } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { InventoryManifest, ManifestInventoryService } from 'src/app/_services/inventory/manifest-inventory.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-manifest-editor-header',
  templateUrl: './manifest-editor-header.component.html',
  styleUrls: ['./manifest-editor-header.component.scss']
})
export class ManifestEditorHeaderComponent implements OnInit {

  @Input()  inputForm         : FormGroup;
  @Output() outPutSave      = new EventEmitter<any>();
  @Output() outPutSaveExit  = new EventEmitter<any>();
  @Output() outPutDispatchManifest  = new EventEmitter<any>();

  currentManifest   : InventoryManifest;
  currentManifest$  : Subscription;
  inventoryItems: IInventoryAssignment[];
  manifestID: number;
  site: ISite;

  currentManifestSite$  : Subscription;

  get isWarehouse(): boolean {
    return this.manifestService.isWarehouse;
  }

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
    private fb              : FormBuilder,
    private sitesService    : SitesService,
    private manifestService : ManifestInventoryService,
    private dialogRef       : MatDialogRef<ManifestEditorHeaderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    const i = 0
    this.initSubscriptions();
  }

  updateItem(event) {
    this.outPutSave.emit('false')
  }

  updateItemExit(event) {
    this.outPutSave.emit('true')
  }

  validateDelete() {
    //rules for allowing manifest to be deleted.
  }

  deleteItem(event) {
    const site  = this.sitesService.getAssignedSite();

    const result = window.confirm('Are you sure you want to delete this manifest?')
    if (!result) { return };

    if (!site && this.manifestID == 0 ) { return }
    this.manifestService.delete(site, this.manifestID).subscribe(data => {
      this.dialogRef.close();
    })
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  // (outputeupdateItem)     ="updateItem($event)"
  // (outputupdateItemExit)E  ="updateItemExit($event)"
  // (outputupdatedeleteItem)="deleteItem($event)"
  // (outputupdateonCancel)  ="onCancel($event)"

  dispatchSendToSite(){
    //getManifestWithProducts(id);
    //ReceiveTransfer
    this.outPutDispatchManifest.emit(true)
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
