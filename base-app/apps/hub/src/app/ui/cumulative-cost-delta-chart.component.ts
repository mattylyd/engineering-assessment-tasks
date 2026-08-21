import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import type * as Highcharts from 'highcharts';
import { HighchartsChartComponent } from 'highcharts-angular';

@Component({
  selector: 'app-cumulative-cost-delta-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HighchartsChartComponent],
  template: `
    <highcharts-chart
      [options]="options()"
      style="width: 100%; height: 320px; display: block;"
    ></highcharts-chart>
  `,
})
export class CumulativeCostDeltaChartComponent {
  protected readonly options = computed<Highcharts.Options>(() => ({
    chart: { type: 'line' },
    title: { text: 'Cumulative cost delta by month' },
    xAxis: { categories: [] },
    yAxis: { title: { text: 'Cost delta' } },
    credits: { enabled: false },
    series: [],
  }));
}
