import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import type * as Highcharts from 'highcharts';
import { HighchartsChartComponent } from 'highcharts-angular';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import type { ChangeOrder } from '@pch/domain';

type StatusFilter = 'all' | 'approved';

@Component({
  selector: 'app-cumulative-cost-delta-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HighchartsChartComponent, MatButtonToggleModule],
  template: `
    <mat-button-toggle-group
      class="mb-3"
      [value]="statusFilter()"
      (change)="statusFilter.set($event.value)"
    >
      <mat-button-toggle value="all">All</mat-button-toggle>
      <mat-button-toggle value="approved">Approved</mat-button-toggle>
    </mat-button-toggle-group>
    <highcharts-chart
      [options]="options()"
      style="width: 100%; height: 320px; display: block;"
    ></highcharts-chart>
  `,
})
export class CumulativeCostDeltaChartComponent {
  readonly changeOrders = input.required<ChangeOrder[]>();

  protected readonly statusFilter = signal<StatusFilter>('all');

  protected readonly options = computed<Highcharts.Options>(() => {
    const filter = this.statusFilter();
    const filtered = this.changeOrders().filter(
      (changeOrder) => filter === 'all' || changeOrder.status === 'approved'
    );

    const deltaByMonth = new Map<string, number>();
    for (const changeOrder of filtered) {
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
        {
          type: 'line',
          name: filter === 'all' ? 'All change orders' : 'Approved only',
          data,
        },
      ],
    };
  });
}