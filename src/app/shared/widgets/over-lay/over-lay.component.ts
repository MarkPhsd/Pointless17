import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";
import { Component, VERSION } from "@angular/core";
import { AppMaterialModule } from "src/app/app-material.module";
import { SharedPipesModule } from "src/app/shared-pipes/shared-pipes.module";

@Component({
  selector: 'app-over-lay',

  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],

  templateUrl: './over-lay.component.html',
  styleUrls: ['./over-lay.component.scss']
})
export class OverLayComponent  {
  isOpen = false;

  constructor() { }



}
