import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type * as Highcharts from 'highcharts';
import { HighchartsChartComponent } from 'highcharts-angular';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import type { ChangeOrder } from '@pch/domain';
import type { ChangeOrderStatusFilter } from '../data-access/project-detail.store';

@Component({
  selector: 'app-cumulative-cost-delta-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HighchartsChartComponent, MatButtonToggleModule],
  template: `
    <mat-button-toggle-group
      class="mb-3"
      [value]="statusFilter()"
      (change)="statusFilterChange.emit($event.value)"
    >
      <mat-button-toggle value="all">All</mat-button-toggle>
      <mat-button-toggle value="approved">Approved</mat-button-toggle>
    </mat-button-toggle-group>
    @if (changeOrders().length > 0) {
      <highcharts-chart
        [options]="options()"
        style="width: 100%; height: 320px; display: block;"
      ></highcharts-chart>
    } @else {
      <p class="text-gray-500" data-testid="change-orders-filter-empty">
        No {{ statusFilter() === 'approved' ? 'approved ' : '' }}change orders
        to show.
      </p>
    }
  `,
})
export class CumulativeCostDeltaChartComponent {
  readonly changeOrders = input.required<ChangeOrder[]>();
  readonly statusFilter = input.required<ChangeOrderStatusFilter>();
  readonly statusFilterChange = output<ChangeOrderStatusFilter>();

  protected readonly options = computed<Highcharts.Options>(() => {
    const filter = this.statusFilter();

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
        {
          type: 'line',
          name: filter === 'all' ? 'All change orders' : 'Approved only',
          data,
        },
      ],
    };
  });
}