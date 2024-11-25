import { Component, OnInit, Input } from '@angular/core';
import { AccordionMenu, accordionConfig } from 'src/app/_interfaces/index';
import { Observable, } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent implements OnInit {

  @Input() options;
  @Input() menus: AccordionMenu[];
  config:         accordionConfig;

  ngOnInit() {
    this.config = this.mergeConfig(this.options);
  }

  mergeConfig(options: accordionConfig) {
    const config = {
      multi: true
    };
    return { ...config, ...options };
  }

  toggle(index: number) {

    if (!this.config.multi) {
      this.menus.filter(
        (menu, i) => i !== index && menu.active
      ).forEach(menu =>
        {
          menu.active = !menu.active
          console.log(menu.name)
        }
      );
    }

    this.menus[index].active = !this.menus[index].active;

  }
}
