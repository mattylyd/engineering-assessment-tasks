import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import type * as Highcharts from 'highcharts';
import { HighchartsChartComponent } from 'highcharts-angular';
import type { ChangeOrder } from '@pch/domain';

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
  readonly changeOrders = input.required<ChangeOrder[]>();

  protected readonly options = computed<Highcharts.Options>(() => {
    const deltaByMonth = new Map<string, number>();
    for (const changeOrder of this.changeOrders()) {
      const month = changeOrder.raisedDate.slice(0, 7);
      deltaByMonth.set(
        month,
        (deltaByMonth.get(month) ?? 0) + changeOrder.costDelta
      );
    }

    const months = [...deltaByMonth.keys()].sort();
    let cumulative = 0;
    const data = months.map(
      (month) => (cumulative += deltaByMonth.get(month) ?? 0)
    );

    return {
      chart: { type: 'line' },
      title: { text: 'Cumulative cost delta by month' },
      xAxis: { categories: months },
      yAxis: { title: { text: 'Cumulative cost delta' } },
      credits: { enabled: false },
      series: [
        { type: 'line', name: 'Cumulative cost delta', data },
      ],
    };
  });
}