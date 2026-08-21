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
import type {
  ChangeOrderStatusFilter,
  CumulativeCostDeltaPoint,
} from '../data-access/project-detail.store';

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
    @if (data().length > 0) {
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
  readonly data = input.required<CumulativeCostDeltaPoint[]>();
  readonly statusFilter = input.required<ChangeOrderStatusFilter>();
  readonly statusFilterChange = output<ChangeOrderStatusFilter>();

  protected readonly options = computed<Highcharts.Options>(() => {
    const points = this.data();
    const filter = this.statusFilter();

    return {
      chart: { type: 'line' },
      title: { text: 'Cumulative cost delta by month' },
      xAxis: { categories: points.map((point) => point.month) },
      yAxis: { title: { text: 'Cumulative cost delta' } },
      credits: { enabled: false },
      series: [
        {
          type: 'line',
          name: filter === 'all' ? 'All change orders' : 'Approved only',
          data: points.map((point) => point.cumulativeDelta),
        },
      ],
    };
  });
}
