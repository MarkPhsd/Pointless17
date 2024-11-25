import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'electron-zoom-control',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './electron-zoom-control.component.html',
  styleUrls: ['./electron-zoom-control.component.scss']
})
export class ElectronZoomControlComponent implements OnInit {

  @Input() zoomValue: number = 1;
  @Output() valueEmit = new EventEmitter<number>();

  constructor(
    private siteService: SitesService,
    private platFormService: PlatformService,
    private settings: SettingsService
  ) {}

  ngOnInit(): void {
    this.zoomValue = this.zoomValue || 1;
  }

  setValue(event: any): void {
    this.valueEmit.emit(this.zoomValue);
  }

  setZoom(): void {
    if (!this.platFormService.isAppElectron) return;

    try {
      (window as any).electron.setZoom(this.zoomValue);
    } catch (error) {
      console.error('Failed to set zoom level:', error);
      this.siteService.notify(`Failed to set zoom level: ${error}`, 'Close', 3000, 'red');
    }
  }

  setZoomDefault(): void {
    this.zoomValue = 1;
    this.setZoom();
  }
}
