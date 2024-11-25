import { Component, OnInit } from '@angular/core';
import { CoachMarksService } from './coach-marks.service';
import { NavParams, PopoverController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';

@Component({
  selector: 'app-coach-marks',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,],
  templateUrl: './coach-marks.component.html',
  styleUrls: ['./coach-marks.component.scss']
})
export class CoachMarksComponent {
  count: number;
  text: string;
  isTheLast: boolean;
  isTheFirst: boolean;

  constructor(
    private navParams: NavParams,
    private popoverController: PopoverController,
    public coachMarksService: CoachMarksService
  ) {
    this.text = this.navParams.get('text');
    this.isTheLast = this.navParams.get('isTheLast');
    this.isTheFirst = this.navParams.get('isTheFirst');
  }

  navPopoverByIndex(index: number) {
    this.coachMarksService.navPopoverByIndex(index);
  }

  next() {
    this.popoverController.dismiss('next');
  }
  previous() {
    this.popoverController.dismiss('previous');
  }
  close() {
    this.popoverController.dismiss('close');
  }

}
