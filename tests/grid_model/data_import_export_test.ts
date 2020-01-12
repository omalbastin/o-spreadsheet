import { GridModel } from "../../src/grid_model";

describe("data", () => {
  test("give default col size if not specified", () => {
    const model = new GridModel({
      colNumber: 10,
      rowNumber: 10,
      cols: { 1: {} },
      cells: { B2: { content: "b2" } }
    });

    // 96 is default cell width
    expect(model.cols[0].size).toEqual(96);
    expect(model.cols[1].size).toEqual(96);
  });
});