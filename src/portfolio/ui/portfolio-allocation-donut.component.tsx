import React, { useState } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import {
  PortfolioAllocationSlice,
  PortfolioAllocationUtils,
} from 'src/portfolio/portfolio-allocation.utils';
import { PortfolioFlowUtils } from 'src/portfolio/portfolio-flow.utils';

import './portfolio-allocation-donut.component.scss';

type PortfolioAllocationDonutProps = {
  showNetworkInTooltip: boolean;
  slices: PortfolioAllocationSlice[];
};

const CHART_SIZE = 104;
const STROKE_WIDTH = 14;
const CENTER = CHART_SIZE / 2;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SEGMENT_GAP = 2.5;

const roundChartValue = (value: number): number =>
  Math.round(value * 100) / 100;

type ChartSegment = PortfolioAllocationSlice & {
  length: number;
  offset: number;
  percentLabel: string;
};

const buildChartSegments = (
  slices: PortfolioAllocationSlice[],
): ChartSegment[] => {
  if (slices.length === 1) {
    return [
      {
        ...slices[0],
        length: roundChartValue(CIRCUMFERENCE),
        offset: 0,
        percentLabel: PortfolioAllocationUtils.formatPortfolioAllocationPercent(
          slices[0].share,
        ),
      },
    ];
  }

  let cursor = 0;

  return slices.map((slice) => {
    const rawLength = slice.share * CIRCUMFERENCE;
    const gap = rawLength > SEGMENT_GAP * 2 ? SEGMENT_GAP : 0;
    const segment: ChartSegment = {
      ...slice,
      length: roundChartValue(Math.max(rawLength - gap, 0)),
      offset: roundChartValue(cursor),
      percentLabel: PortfolioAllocationUtils.formatPortfolioAllocationPercent(
        slice.share,
      ),
    };
    cursor += rawLength;
    return segment;
  });
};

const getSliceTooltipMessage = (
  slice: ChartSegment,
  showNetworkInTooltip: boolean,
): string => {
  const value = PortfolioFlowUtils.formatPortfolioUsdValue(slice.usdValue);
  const identity =
    showNetworkInTooltip && slice.network
      ? `${slice.symbol} · ${slice.network}`
      : slice.symbol;

  return `${identity} · ${value} · ${slice.percentLabel}`;
};

export const PortfolioAllocationDonut = ({
  showNetworkInTooltip,
  slices,
}: PortfolioAllocationDonutProps) => {
  const segments = buildChartSegments(slices);
  const [hoveredSliceKey, setHoveredSliceKey] = useState<string | null>(null);
  const hoveredSegment =
    segments.find((segment) => segment.key === hoveredSliceKey) ?? null;

  return (
    <div className="portfolio-allocation">
      <CustomTooltip
        additionalClassName="portfolio-allocation__chart-tooltip"
        dataTestId="portfolio-allocation-chart-tooltip"
        message={
          hoveredSegment
            ? getSliceTooltipMessage(hoveredSegment, showNetworkInTooltip)
            : ''
        }
        position="top"
        skipTranslation>
        <svg
          aria-hidden="true"
          className="portfolio-allocation__chart"
          onMouseLeave={() => setHoveredSliceKey(null)}
          viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
          <circle
            className="portfolio-allocation__track"
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE_WIDTH}
          />
          {segments.map((segment) =>
            segment.length <= 0 ? null : (
              <circle
                key={segment.key}
                data-testid="portfolio-allocation-slice"
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={segment.color}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={
                  segment.length >= roundChartValue(CIRCUMFERENCE)
                    ? undefined
                    : `${segment.length} ${roundChartValue(
                        CIRCUMFERENCE - segment.length,
                      )}`
                }
                strokeDashoffset={
                  segment.offset === 0 ? undefined : -segment.offset
                }
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
                onMouseEnter={() => setHoveredSliceKey(segment.key)}
              />
            ),
          )}
        </svg>
      </CustomTooltip>
      <ul className="portfolio-allocation__legend">
        {segments.map((segment) => (
          <li
            className="portfolio-allocation__item"
            data-testid="portfolio-allocation-item"
            key={segment.key}>
            <CustomTooltip
              additionalClassName="portfolio-allocation__item-tooltip"
              dataTestId="portfolio-allocation-tooltip"
              message={getSliceTooltipMessage(segment, showNetworkInTooltip)}
              position="top"
              skipTranslation>
              <span className="portfolio-allocation__item-body">
                <span
                  className="portfolio-allocation__swatch"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="portfolio-allocation__token">
                  <span className="portfolio-allocation__symbol">
                    {segment.symbol}
                  </span>
                  {segment.network ? (
                    <span className="portfolio-allocation__network">
                      {segment.network}
                    </span>
                  ) : null}
                </span>
                <span className="portfolio-allocation__percent">
                  {segment.percentLabel}
                </span>
              </span>
            </CustomTooltip>
          </li>
        ))}
      </ul>
    </div>
  );
};
