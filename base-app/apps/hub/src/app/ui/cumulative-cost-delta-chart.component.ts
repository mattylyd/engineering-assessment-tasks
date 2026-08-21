import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type * as Highcharts from 'highcharts';
import { HighchartsChartComponent } from 'highcharts-angular';
import {
  MatButtonToggleChange,
  MatButtonToggleModule,
} from '@angular/material/button-toggle';

export type ChangeOrderStatusFilter = 'all' | 'approved';

export interface CumulativeCostDeltaPoint {
  month: string;
  cumulativeDelta: number;
}

function isChangeOrderStatusFilter(
  value: unknown
): value is ChangeOrderStatusFilter {
  return value === 'all' || value === 'approved';
}

@Component({
  selector: 'app-cumulative-cost-delta-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HighchartsChartComponent, MatButtonToggleModule],
  template: `
    <mat-button-toggle-group
      class="mb-3"
      [value]="statusFilter()"
      (change)="onStatusFilterChange($event)"
    >
      <mat-button-toggle value="all">All</mat-button-toggle>
      <mat-button-toggle value="approved">Approved</mat-button-toggle>
    </mat-button-toggle-group>
    @if (points().length > 0) {
      <highcharts-chart
        [options]="options()"
        style="width: 100%; height: 320px; display: block;"
      ></highcharts-chart>
    } @else {
      <p class="text-gray-500" data-testid="change-orders-filter-empty">
        No {{ isApprovedOnly() ? 'approved ' : '' }}change orders to show.
      </p>
    }
  `,
})
export class CumulativeCostDeltaChartComponent {
  readonly points = input.required<CumulativeCostDeltaPoint[]>();
  readonly statusFilter = input.required<ChangeOrderStatusFilter>();
  readonly statusFilterChange = output<ChangeOrderStatusFilter>();

  protected readonly isApprovedOnly = computed(
    () => this.statusFilter() === 'approved'
  );

  protected readonly options = computed<Highcharts.Options>(() => {
    const points = this.points();

    return {
      chart: { type: 'line' },
      title: { text: 'Cumulative cost delta by month' },
      xAxis: { categories: points.map((point) => point.month) },
      yAxis: { title: { text: 'Cumulative cost delta' } },
      credits: { enabled: false },
      series: [
        {
          type: 'line',
          name: this.isApprovedOnly() ? 'Approved only' : 'All change orders',
          data: points.map((point) => point.cumulativeDelta),
        },
      ],
    };
  });

  protected onStatusFilterChange(change: MatButtonToggleChange): void {
    if (isChangeOrderStatusFilter(change.value)) {
      this.statusFilterChange.emit(change.value);
    }
  }
}