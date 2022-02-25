import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { Component, VERSION } from "@angular/core";

@Component({
  selector: 'app-over-lay',
  templateUrl: './over-lay.component.html',
  styleUrls: ['./over-lay.component.scss']
})
export class OverLayComponent  {
  isOpen = false;

  constructor() { }



}
