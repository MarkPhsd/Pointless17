// import the required animation functions from the angular animations module
import { trigger, state, animate, transition, style } from '@angular/animations';

export const popOverState =
    trigger('popOverState', [
     
        state('show', style({opacity: 1})),

        state('hide',  style({opacity: 0 })),

        transition('show => hide', animate('600ms ease-out')),
        transition('hide => show', animate('1000ms ease-in'))
    ])


