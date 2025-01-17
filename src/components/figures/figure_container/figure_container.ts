import { Component, onMounted } from "@odoo/owl";
import { Figure, SpreadsheetChildEnv } from "../../../types/index";
import { FigureComponent } from "../figure/figure";

interface Props {
  onFigureDeleted: () => void;
}

export class FiguresContainer extends Component<Props, SpreadsheetChildEnv> {
  static template = "o-spreadsheet-FiguresContainer";
  static components = { FigureComponent };

  getVisibleFigures(): Figure[] {
    return this.env.model.getters.getVisibleFigures();
  }

  setup() {
    onMounted(() => {
      // horrible, but necessary
      // the following line ensures that we render the figures with the correct
      // viewport.  The reason is that whenever we initialize the grid
      // component, we do not know yet the actual size of the viewport, so the
      // first owl rendering is done with an empty viewport.  Only then we can
      // compute which figures should be displayed, so we have to force a
      // new rendering
      this.render();
    });
  }
}

FiguresContainer.props = {
  onFigureDeleted: Function,
};
