import React from 'react';
import { PortfolioNavIcon } from 'src/portfolio/ui/portfolio-nav-icon.enum';

type Props = {
  icon: PortfolioNavIcon;
  className?: string;
};

const SW = 1.5;

/**
 * Inline SVGs so `var(--bottom-bar-icon-color)` / `var(--wallet-icon-*)` from the sidebar
 * resolve correctly. External SVG `<img>` / ReactSVG do not inherit page CSS variables.
 */
export const PortfolioSidebarNavIcon = ({ icon, className }: Props) => {
  const strokeProps = {
    strokeWidth: SW,
    vectorEffect: 'non-scaling-stroke' as const,
  };

  switch (icon) {
    case PortfolioNavIcon.PORTFOLIO:
      return (
        <svg
          className={className}
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden>
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="var(--wallet-icon-color)"
            fill="none"
            {...strokeProps}
          />
          <path
            d="M12 12H21"
            stroke="var(--wallet-icon-color)"
            strokeLinecap="round"
            {...strokeProps}
          />
          <path
            d="M12 3V11.9379C12 11.9777 12.0158 12.0158 12.0439 12.0439L18 18"
            stroke="var(--wallet-icon-color)"
            strokeLinecap="round"
            {...strokeProps}
          />
        </svg>
      );
    case PortfolioNavIcon.BUY:
      return (
        <svg
          className={className}
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          fill="none"
          viewBox="0 0 25 24"
          aria-hidden>
          <path
            stroke="var(--bottom-bar-icon-color)"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...strokeProps}
            d="M19.137 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-12 5h5m-5 4h9"
          />
          <path
            stroke="var(--bottom-bar-icon-color)"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...strokeProps}
            d="M14.137 2h-5c-5 0-7 2-7 7v6c0 5 2 7 7 7h6c5 0 7-2 7-7v-5"
          />
        </svg>
      );
    case PortfolioNavIcon.SELL:
      return (
        <svg
          className={className}
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden>
          <path
            stroke="var(--wallet-icon-color)"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...strokeProps}
            d="m7.376 8.524 6.692-2.23c3.003-1 4.634.638 3.641 3.64l-2.23 6.691c-1.498 4.5-3.957 4.5-5.455 0l-.662-1.986-1.986-.662c-4.501-1.497-4.501-3.948 0-5.453Z"
          />
          <path
            stroke="var(--wallet-icon-secondary-color)"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...strokeProps}
            d="m11 12.999 3-3"
          />
        </svg>
      );
    case PortfolioNavIcon.SWAP:
      return (
        <svg
          className={className}
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          fill="none"
          viewBox="0 0 25 25"
          aria-hidden>
          <path
            d="M14.4221 3.97803L16.8621 6.31805L8.91211 6.29803C5.34211 6.29803 2.41211 9.22805 2.41211 12.8181C2.41211 14.6081 3.1421 16.238 4.3221 17.418"
            stroke="var(--bottom-bar-icon-color)"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...strokeProps}
          />
          <path
            d="M10.4219 21.9781L7.98193 19.6381L15.9319 19.6581C19.5019 19.6581 22.4319 16.7281 22.4319 13.1381C22.4319 11.3481 21.7019 9.71809 20.5219 8.53809"
            stroke="var(--bottom-bar-icon-color)"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...strokeProps}
          />
          <path
            d="M9.42188 12.978H15.4219"
            stroke="var(--bottom-bar-icon-color)"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...strokeProps}
          />
        </svg>
      );
    case PortfolioNavIcon.BRIDGE:
      return (
        <svg
          className={className}
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden>
          <path
            stroke="var(--wallet-icon-color)"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...strokeProps}
            d="M19 12c0 3.864-3.136 7-7 7s-6.223-3.892-6.223-3.892m0 0h3.164m-3.164 0v3.5M5 12c0-3.864 3.108-7 7-7 4.67 0 7 3.892 7 3.892m0 0v-3.5m0 3.5h-3.107"
          />
          <path
            stroke="var(--wallet-icon-secondary-color)"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...strokeProps}
            d="M10.869 12.859c0 .553.424.999.952.999h1.076c.459 0 .832-.39.832-.87 0-.524-.228-.708-.566-.828l-1.728-.6c-.34-.12-.566-.305-.566-.828 0-.48.373-.87.832-.87h1.076c.527 0 .952.445.952.998m-1.433-1.572v5.146"
          />
        </svg>
      );
    case PortfolioNavIcon.HISTORY:
      return (
        <svg
          className={className}
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden>
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="var(--wallet-icon-color)"
            fill="none"
            {...strokeProps}
          />
          <path
            stroke="var(--wallet-icon-color)"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            {...strokeProps}
            d="M12 7v5l3 2.5"
          />
        </svg>
      );
    default:
      return null;
  }
};
