import { C } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { InventoryManifest, ManifestInventoryService } from 'src/app/_services/inventory/manifest-inventory.service';

@Component({
  selector: 'app-manifest-editor-header',
  templateUrl: './manifest-editor-header.component.html',
  styleUrls: ['./manifest-editor-header.component.scss']
})
export class ManifestEditorHeaderComponent implements OnInit {

  @Input()  inputForm         : FormGroup;
  @Output() outPutSave      = new EventEmitter<any>();
  @Output() outPutSaveExit  = new EventEmitter<any>();

  currentManifest   : InventoryManifest;
  currentManifest$  : Subscription;
  inventoryItems: IInventoryAssignment[];
  manifestID: number;
  site: ISite;

  currentManifestSite$  : Subscription;

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
    private manifestService: ManifestInventoryService,
    private dialogRef: MatDialogRef<ManifestEditorHeaderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    const i = 0
    this.initSubscriptions();
  }

  updateItem(event) {
    console.log('event')
    this.outPutSave.emit('false')
  }

  updateItemExit(event) {
    console.log('event 2')
    this.outPutSave.emit('true')
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
