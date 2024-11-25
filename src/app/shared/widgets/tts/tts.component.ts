import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { TtsService } from 'src/app/_services/system/tts-service.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-tts-component',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  template: `
    <button (click)="addText()">Add Text to Queue</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TtsComponent {
  constructor(private ttsService: TtsService, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  addText() {
    this.zone.runOutsideAngular(() => {
      this.ttsService.addTextToQueue('This is a test text to speak.', 'Microsoft Zira');
    });
  }

  // Optionally detach change detection for further optimization
  ngOnInit() {
    this.cdr.detach();
  }
}
