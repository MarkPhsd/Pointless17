import {  trigger, state, animate, transition, style,
          query,stagger,animateChild, keyframes } from '@angular/animations';

export const listAnimation =
// nice stagger effect when showing existing elements
  trigger('list', [
    transition(':enter', [
      // child animation selector + stagger
      query('@items',
        stagger(300, animateChild())
      )
    ]),
  ]);

export const itemsAnimation =
  trigger('items', [
    // cubic-bezier for a tiny bouncing feel
    transition(':enter', [
      style({ transform: 'scale(0.5)', opacity: 0 }),
      animate('1s cubic-bezier(.8,-0.6,0.2,1.5)',
        style({ transform: 'scale(1)', opacity: 1 }))
    ]),
    transition(':leave', [
      style({ transform: 'scale(1)', opacity: 1, height: '*' }),
      animate('1s cubic-bezier(.8,-0.6,0.2,1.5)',
        style({ transform: 'scale(0.5)', opacity: 0, height: '0px', margin: '0px' }))
    ]),
  ]);

  export const fadeSlideGrowKeyframe =
    trigger('fadeSlideGrowKeyframe', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.5) translateY(50px)' }),
      animate(
        '500ms',
        keyframes([
          style({ opacity: 1, offset: 0.3 }),
          style({ transform: 'translateY(0)', offset: 0.6 }),
          style({ transform: 'scale(1)', offset: 1 }),
        ])
      ),
    ]),
  ]);

  export const wobble = [
    style({transform: 'translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg)', offset: .15}),
    style({transform: 'translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg)', offset: .30}),
    style({transform: 'translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg)', offset: .45}),
    style({transform: 'translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg)', offset: .60}),
    style({transform: 'translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg)', offset: .75}),
    style({transform: 'none', offset: 1})
]

export const jello = [
    // style({transform: 'none', offset: .111}),
    style({transform: 'skewX(-12.5deg) skewY(-12.5deg)', offset: .111}),
    style({transform: 'skewX(6.25deg) skewY(6.25deg)', offset: .222}),
    style({transform: 'skewX(-3.125deg) skewY(-3.125deg)', offset: .333}),
    style({transform: 'skewX(1.5625deg) skewY(1.5625deg)', offset: .444}),
    style({transform: 'skewX(-0.78125deg) skewY(-0.78125deg)', offset: .555}),
    style({transform: 'skewX(0.390625deg) skewY(0.390625deg)', offset: .666}),
    style({transform: 'skewX(0.390625deg) skewY(0.390625deg)', offset: .777}),
    style({transform: 'skewX(-0.1953125deg) skewY(-0.1953125deg)', offset: .888}),
    style({transform: 'none', offset: 1})
]

export const swing = [
    style({transform: 'rotate3d(0, 0, 1, 15deg)', offset: .2}),
    style({transform: 'rotate3d(0, 0, 1, -10deg)', offset: .4}),
    style({transform: 'rotate3d(0, 0, 1, 5deg)', offset: .6}),
    style({transform: 'rotate3d(0, 0, 1, -5deg)', offset: .8}),
    style({transform: 'none', offset: 1})
]

export const slideOutLeft = [
    style({transform: 'translate3d(0, 0, 0)', offset: 0}),
    style({transform: 'translate3d(-150%, 0, 0)', opacity: 0, offset: 1}),
]

export const zoomOutLeft = [
  style({transform: 'scale3d(.475, .475, .475) translate3d(-42px, 0, 0)', offset: .4}),
  style({transform: 'scale(.1) translate3d(2000px, 0, 0)', 'transform-origin': 'right center', offset: 1}),
]

export const zoomOutRight = [
    style({transform: 'scale3d(.475, .475, .475) translate3d(-42px, 0, 0)', offset: .4}),
    style({transform: 'scale(.1) translate3d(2000px, 0, 0)', 'transform-origin': 'right center', offset: 1}),
]

export const rotateOutUpRight = [
    style({ transform: 'rotate3d(0, 0, 0, 0deg)', opacity: 1, 'transform-origin': 'right bottom', offset: 0}),
    style({ transform: 'rotate3d(0, 0, 1, 90deg)', opacity: 0, 'transform-origin': 'right bottom', offset: 1}),
]

export const flipOutY = [
    style({ transform: 'perspective(400px)', offset: 0}),
    style({ transform: 'perspective(400px) rotate3d(0, 1, 0, -15deg)', opacity: 1, offset: 0.33}),
    style({ transform: 'perspective(400px) rotate3d(0, 1, 0, 90deg)', opacity: 0, offset: 1}),
]

    // // nice stagger effect when showing existing elements
    // trigger('list', [
    //   transition(':enter', [
    //     // child animation selector + stagger
    //     query('@items',
    //       stagger(300, animateChild())
    //     )
    //   ]),
    // ]),
    // trigger('items', [
    //   // cubic-bezier for a tiny bouncing feel
    //   transition(':enter', [
    //     style({ transform: 'scale(0.5)', opacity: 0 }),
    //     animate('1s cubic-bezier(.8,-0.6,0.2,1.5)',
    //       style({ transform: 'scale(1)', opacity: 1 }))
    //   ]),
    //   transition(':leave', [
    //     style({ transform: 'scale(1)', opacity: 1, height: '*' }),
    //     animate('1s cubic-bezier(.8,-0.6,0.2,1.5)',
    //       style({ transform: 'scale(0.5)', opacity: 0, height: '0px', margin: '0px' }))
    //   ]),
    // ])
