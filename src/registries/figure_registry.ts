import { Registry } from "../registry";
import { TextFigure } from "../components/figures/text_figure";

//------------------------------------------------------------------------------
// Figure Registry
//------------------------------------------------------------------------------

/**
 * This registry is intended to map a type of figure (tag) to a class of
 * component, that will be used in the UI to represent the figure.
 *
 * The most important type of figure will be the Chart
 */

export interface FigureContent {
  Component: any;
}

export const figureRegistry = new Registry<FigureContent>();

// figureRegistry.add("ConditionalFormatting", {
//   title: "Conditional formatting",
//   Body: ConditionalFormattingPanel,
// });
//

figureRegistry.add("text", { Component: TextFigure });