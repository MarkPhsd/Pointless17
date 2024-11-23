import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyButton, MatLegacyButtonModule } from '@angular/material/legacy-button';
import { ScaleSettingsComponent } from './scale-settings/scale-settings.component';
import { UIHomePageSettingsComponent } from './uihome-page-settings/uihome-page-settings.component';
import { UITransactionsComponent } from './UISettings/uitransactions/uitransactions.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-software-settings',
  standalone: true,
  imports: [CommonModule,MatExpansionModule,MatLegacyButtonModule,UIHomePageSettingsComponent,
      UITransactionsComponent,ScaleSettingsComponent,MatIconModule,
  ],
  templateUrl: './software.component.html',
  styleUrls: ['./software.component.scss']
})
export class SoftwareSettingsComponent  {

  @ViewChild('accordionStep0') accordionStep0: TemplateRef<any>;
  @ViewChild('accordionStep1') accordionStep1: TemplateRef<any>;
  @ViewChild('accordionStep2') accordionStep2: TemplateRef<any>;
  @ViewChild('accordionStep3') accordionStep3: TemplateRef<any>;
  @ViewChild('accordionStep4') accordionStep4: TemplateRef<any>;
  @ViewChild('accordionStep5') accordionStep5: TemplateRef<any>;
  @ViewChild('accordionStep6') accordionStep6: TemplateRef<any>;
  @ViewChild('accordionStep7') accordionStep7: TemplateRef<any>;

  accordionStep = -1;

  constructor() { }

  setStep(index: number) {
    this.accordionStep = index;
  }

  get currentAccordionStep() {
    switch ( this.accordionStep) {
      case 0:
        return this.accordionStep0;
        break;
      case 1:
        return this.accordionStep1;
        break;
      case 2:
        return this.accordionStep2;
        break;
      case 3:
        return this.accordionStep3;
        break;
      case 4:
        return this.accordionStep4;
        break;
      case 5:
        return this.accordionStep5;
        break;
      case 6:
        return this.accordionStep6;
        break;
      case 7:
        return this.accordionStep7;
        break;
      default:
        return null;
        break;
    }
  }

}
