import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { InventoryManifest, ManifestInventoryService } from 'src/app/_services/inventory/manifest-inventory.service';

@Component({
  selector: 'app-mainfest-editor',
  templateUrl: './mainfest-editor.component.html',
  styleUrls: ['./mainfest-editor.component.scss']
})
export class MainfestEditorComponent implements OnInit {


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
    const i = 0;
    this.initSubscriptions()
  }

}
