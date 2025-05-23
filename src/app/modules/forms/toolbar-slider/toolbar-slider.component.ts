import {
  ChangeDetectionStrategy, Component, input, model,
} from '@angular/core';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { TestDirective } from 'app/modules/test-id/test.directive';

@Component({
  selector: 'ix-toolbar-slider',
  styleUrls: ['./toolbar-slider.component.scss'],
  templateUrl: './toolbar-slider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatSlider,
    MatSliderThumb,
    TestDirective,
  ],
})
export class ToolbarSliderComponent {
  readonly min = input<number>();
  readonly max = input<number>();
  readonly step = input<number>(1);
  readonly label = input<string>();
  readonly name = input<string>();

  readonly value = model.required<number>();

  onChange(updatedValue: string): void {
    this.value.set(Number(updatedValue));
  }
}
