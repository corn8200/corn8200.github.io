/// <reference types="react" />
import { Theme } from '@models/Theme';
import { TimelineMode } from '@models/TimelineModel';
export declare const Wrapper: import("styled-components").IStyledComponent<"web", import("styled-components/dist/types").Substitute<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {
    $hideControls?: boolean;
    cardPositionHorizontal?: 'TOP' | 'BOTTOM';
}>>;
export declare const TimelineMainWrapper: import("styled-components").IStyledComponent<"web", import("styled-components/dist/types").Substitute<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {
    $scrollable?: boolean | {
        scrollbar: boolean;
    };
    mode?: TimelineMode;
    theme?: Theme;
}>>;
export declare const TimelineMain: import("styled-components").IStyledComponent<"web", import("styled-components/dist/types").FastOmit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, never>>;
export declare const Outline: import("styled-components").IStyledComponent<"web", import("styled-components/dist/types").Substitute<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {
    color?: string;
    height?: number;
}>>;
export declare const TimelineControlContainer: import("styled-components").IStyledComponent<"web", import("styled-components/dist/types").Substitute<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {
    active?: boolean;
    mode?: TimelineMode;
}>>;
export declare const TimelineContentRender: import("styled-components").IStyledComponent<"web", import("styled-components/dist/types").Substitute<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {
    $showAllCards?: boolean;
}>>;
