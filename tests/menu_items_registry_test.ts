import { Model } from "../src";
import { menuItemRegistry } from "../src/components";
import { fontSizes } from "../src/fonts";
import { FullActionMenuItem } from "../src/menu_items_registry";
import { CommandResult, SpreadsheetEnv } from "../src/types";
import { GridParent, makeTestFixture } from "./helpers";

function getNode(_path: string[]): FullActionMenuItem {
  const path = [..._path];
  const root = path.splice(0, 1)[0];
  let node = menuItemRegistry.get(root);
  for (let p of path) {
    node = node.children.find((child) => child.id === p)!;
  }
  return node;
}

function doAction(path: string[], env: SpreadsheetEnv): void {
  const node = getNode(path);
  node.action(env);
}

function getName(path: string[], env: SpreadsheetEnv): string {
  const node = getNode(path);
  return typeof node.name === "function" ? node.name(env).toString() : node.name.toString();
}

describe("Menu Item Registry", () => {
  let menuDefinitions;
  beforeEach(() => {
    menuDefinitions = Object.assign({}, menuItemRegistry.content);
  });

  afterEach(() => {
    menuItemRegistry.content = menuDefinitions;
  });
  test("Can add children to menu Items", () => {
    menuItemRegistry.add("root", { name: "Root", sequence: 1 });
    menuItemRegistry.addChild("child1", ["root"], { name: "Child1", sequence: 1 });
    menuItemRegistry.addChild("child2", ["root", "child1"], { name: "Child2", sequence: 1 });
    const item = menuItemRegistry.get("root");
    expect(item.children).toHaveLength(1);
    expect(item.children[0].name).toBe("Child1");
    expect(item.children[0].id).toBe("child1");
    expect(item.children[0].children).toHaveLength(1);
    expect(item.children[0].children[0].name).toBe("Child2");
    expect(item.children[0].children[0].id).toBe("child2");
  });

  test("Adding a child to non-existing item throws", () => {
    expect(() =>
      menuItemRegistry.addChild("child", ["non-existing"], { name: "child", sequence: 1 })
    ).toThrow();
    menuItemRegistry.add("root", { name: "Root", sequence: 1 });
    expect(() =>
      menuItemRegistry.addChild("child1", ["root", "non-existing"], { name: "Child1", sequence: 1 })
    ).toThrow();
  });
});

describe("Menu Item actions", () => {
  let fixture: HTMLElement;
  let model: Model;
  let parent: GridParent;
  let env: SpreadsheetEnv;

  beforeEach(async () => {
    fixture = makeTestFixture();
    model = new Model();
    parent = new GridParent(model);
    env = parent.env;
    await parent.mount(fixture);
    env.dispatch = jest.fn(() => ({ status: "SUCCESS" } as CommandResult));
  });

  test("Edit -> undo", () => {
    doAction(["edit", "undo"], env);
    expect(env.dispatch).toHaveBeenCalledWith("UNDO");
  });

  test("Edit -> redo", () => {
    doAction(["edit", "redo"], env);
    expect(env.dispatch).toHaveBeenCalledWith("REDO");
  });

  test("Edit -> copy", () => {
    doAction(["edit", "copy"], env);
    expect(env.dispatch).toHaveBeenCalledWith("COPY", {
      target: env.getters.getSelectedZones(),
    });
  });

  test("Edit -> cut", () => {
    doAction(["edit", "cut"], env);
    expect(env.dispatch).toHaveBeenCalledWith("CUT", {
      target: env.getters.getSelectedZones(),
    });
  });

  test("Edit -> paste", () => {
    doAction(["edit", "paste"], env);

    expect(env.dispatch).toHaveBeenCalledWith("PASTE", {
      interactive: true,
      target: [{ bottom: 0, left: 0, right: 0, top: 0 }],
    });
  });

  test("Edit -> paste_special -> paste_special_format", () => {
    doAction(["edit", "paste_special", "paste_special_format"], env);
    expect(env.dispatch).toHaveBeenCalledWith("PASTE", {
      target: env.getters.getSelectedZones(),
      onlyFormat: true,
    });
  });

  test("Edit -> edit_delete_cell_values", () => {
    doAction(["edit", "edit_delete_cell_values"], env);
    expect(env.dispatch).toHaveBeenCalledWith("DELETE_CONTENT", {
      sheet: env.getters.getActiveSheet(),
      target: env.getters.getSelectedZones(),
    });
  });

  describe("Edit -> edit_delete_row", () => {
    const path = ["edit", "edit_delete_row"];

    test("A selected row", () => {
      model.dispatch("SELECT_ROW", { index: 4, createRange: true });
      expect(getName(path, env)).toBe("Delete row 5");
    });

    test("Multiple selected rows", () => {
      model.dispatch("SELECT_ROW", { index: 4, createRange: true });
      model.dispatch("SELECT_ROW", { index: 5, updateRange: true });
      expect(getName(path, env)).toBe("Delete rows 5 - 6");
      doAction(path, env);
      expect(env.dispatch).toHaveBeenLastCalledWith("REMOVE_ROWS", {
        sheet: env.getters.getActiveSheet(),
        rows: [4, 5],
      });
    });

    test("A selected cell", () => {
      model.dispatch("SELECT_CELL", { col: 3, row: 3 });
      expect(getName(path, env)).toBe("Delete row 4");
    });

    test("Multiple selected cells", () => {
      model.dispatch("SELECT_CELL", { col: 3, row: 3 });
      model.dispatch("ALTER_SELECTION", { cell: [4, 4] });
      expect(getName(path, env)).toBe("Delete rows 4 - 5");
      doAction(path, env);
      expect(env.dispatch).toHaveBeenLastCalledWith("REMOVE_ROWS", {
        sheet: env.getters.getActiveSheet(),
        rows: [3, 4],
      });
    });
  });

  describe("Edit -> edit_delete_column", () => {
    const path = ["edit", "edit_delete_column"];

    test("A selected column", () => {
      model.dispatch("SELECT_COLUMN", { index: 4, createRange: true });
      expect(getName(path, env)).toBe("Delete column E");
      doAction(path, env);
      expect(env.dispatch).toHaveBeenLastCalledWith("REMOVE_COLUMNS", {
        sheet: env.getters.getActiveSheet(),
        columns: [4],
      });
    });

    test("Multiple selected columns", () => {
      model.dispatch("SELECT_COLUMN", { index: 4, createRange: true });
      model.dispatch("SELECT_COLUMN", { index: 5, updateRange: true });
      expect(getName(path, env)).toBe("Delete columns E - F");
      doAction(path, env);
      expect(env.dispatch).toHaveBeenLastCalledWith("REMOVE_COLUMNS", {
        sheet: env.getters.getActiveSheet(),
        columns: [4, 5],
      });
    });

    test("A selected cell", () => {
      model.dispatch("SELECT_CELL", { col: 3, row: 3 });
      expect(getName(path, env)).toBe("Delete column D");
      doAction(path, env);
      expect(env.dispatch).toHaveBeenLastCalledWith("REMOVE_COLUMNS", {
        sheet: env.getters.getActiveSheet(),
        columns: [3],
      });
    });

    test("Multiple selected cells", () => {
      model.dispatch("SELECT_CELL", { col: 3, row: 3 });
      model.dispatch("ALTER_SELECTION", { cell: [4, 4] });
      expect(getName(path, env)).toBe("Delete columns D - E");
      doAction(path, env);
      expect(env.dispatch).toHaveBeenLastCalledWith("REMOVE_COLUMNS", {
        sheet: env.getters.getActiveSheet(),
        columns: [3, 4],
      });
    });
  });

  describe("Insert -> Row above", () => {
    const path = ["insert", "insert_row_before"];

    test("A selected row", () => {
      model.dispatch("SELECT_ROW", { index: 4, createRange: true });
      expect(getName(path, env)).toBe("Row above");
    });

    test("Multiple selected rows", () => {
      model.dispatch("SELECT_ROW", { index: 4, createRange: true });
      model.dispatch("SELECT_ROW", { index: 5, updateRange: true });
      expect(getName(path, env)).toBe("2 Rows above");
      doAction(path, env);
      expect(env.dispatch).toHaveBeenLastCalledWith("ADD_ROWS", {
        sheet: env.getters.getActiveSheet(),
        row: 4,
        quantity: 2,
        position: "before",
      });
    });

    test("A selected cell", () => {
      model.dispatch("SELECT_CELL", { col: 3, row: 3 });
      expect(getName(path, env)).toBe("Row above");
    });

    test("Multiple selected cells", () => {
      model.dispatch("SELECT_CELL", { col: 3, row: 3 });
      model.dispatch("ALTER_SELECTION", { cell: [4, 4] });
      expect(getName(path, env)).toBe("2 Rows above");
      doAction(path, env);
      expect(env.dispatch).toHaveBeenLastCalledWith("ADD_ROWS", {
        sheet: env.getters.getActiveSheet(),
        row: 3,
        quantity: 2,
        position: "before",
      });
    });
  });

  describe("Insert -> Row below", () => {
    const path = ["insert", "insert_row_after"];

    test("A selected row", () => {
      model.dispatch("SELECT_ROW", { index: 4, createRange: true });
      expect(getName(path, env)).toBe("Row below");
    });

    test("Multiple selected rows", () => {
      model.dispatch("SELECT_ROW", { index: 4, createRange: true });
      model.dispatch("SELECT_ROW", { index: 5, updateRange: true });
      expect(getName(path, env)).toBe("2 Rows below");
      doAction(path, env);
      expect(env.dispatch).toHaveBeenLastCalledWith("ADD_ROWS", {
        sheet: env.getters.getActiveSheet(),
        row: 5,
        quantity: 2,
        position: "after",
      });
    });

    test("A selected cell", () => {
      model.dispatch("SELECT_CELL", { col: 3, row: 3 });
      expect(getName(path, env)).toBe("Row below");
    });

    test("Multiple selected cells", () => {
      model.dispatch("SELECT_CELL", { col: 3, row: 3 });
      model.dispatch("ALTER_SELECTION", { cell: [4, 4] });
      expect(getName(path, env)).toBe("2 Rows below");
      doAction(path, env);
      expect(env.dispatch).toHaveBeenLastCalledWith("ADD_ROWS", {
        sheet: env.getters.getActiveSheet(),
        row: 4,
        quantity: 2,
        position: "after",
      });
    });
  });

  describe("Insert -> Column left", () => {
    const path = ["insert", "insert_column_before"];

    test("A selected column", () => {
      model.dispatch("SELECT_COLUMN", { index: 4, createRange: true });
      expect(getName(path, env)).toBe("Column left");
    });

    test("Multiple selected columns", () => {
      model.dispatch("SELECT_COLUMN", { index: 4, createRange: true });
      model.dispatch("SELECT_COLUMN", { index: 5, updateRange: true });
      expect(getName(path, env)).toBe("2 Columns left");
      doAction(path, env);
      expect(env.dispatch).toHaveBeenLastCalledWith("ADD_COLUMNS", {
        sheet: env.getters.getActiveSheet(),
        column: 4,
        quantity: 2,
        position: "before",
      });
    });

    test("A selected cell", () => {
      model.dispatch("SELECT_CELL", { col: 3, row: 3 });
      expect(getName(path, env)).toBe("Column left");
    });

    test("Multiple selected cells", () => {
      model.dispatch("SELECT_CELL", { col: 3, row: 3 });
      model.dispatch("ALTER_SELECTION", { cell: [4, 4] });
      expect(getName(path, env)).toBe("2 Columns left");
      doAction(path, env);
      expect(env.dispatch).toHaveBeenLastCalledWith("ADD_COLUMNS", {
        sheet: env.getters.getActiveSheet(),
        column: 3,
        quantity: 2,
        position: "before",
      });
    });
  });

  describe("Insert -> Column right", () => {
    const path = ["insert", "insert_column_after"];

    test("A selected column", () => {
      model.dispatch("SELECT_COLUMN", { index: 4, createRange: true });
      expect(getName(path, env)).toBe("Column right");
    });

    test("Multiple selected columns", () => {
      model.dispatch("SELECT_COLUMN", { index: 4, createRange: true });
      model.dispatch("SELECT_COLUMN", { index: 5, updateRange: true });
      expect(getName(path, env)).toBe("2 Columns right");
      doAction(path, env);
      expect(env.dispatch).toHaveBeenLastCalledWith("ADD_COLUMNS", {
        sheet: env.getters.getActiveSheet(),
        column: 5,
        quantity: 2,
        position: "after",
      });
    });

    test("A selected cell", () => {
      model.dispatch("SELECT_CELL", { col: 3, row: 3 });
      expect(getName(path, env)).toBe("Column right");
    });

    test("Multiple selected cells", () => {
      model.dispatch("SELECT_CELL", { col: 3, row: 3 });
      model.dispatch("ALTER_SELECTION", { cell: [4, 4] });
      expect(getName(path, env)).toBe("2 Columns right");
      doAction(path, env);
      expect(env.dispatch).toHaveBeenLastCalledWith("ADD_COLUMNS", {
        sheet: env.getters.getActiveSheet(),
        column: 4,
        quantity: 2,
        position: "after",
      });
    });
  });

  test("Insert -> new sheet", () => {
    doAction(["insert", "insert_sheet"], env);
    expect(env.dispatch).toHaveBeenCalledWith("CREATE_SHEET", { activate: true });
  });

  describe("Format -> numbers", () => {
    test("Automatic", () => {
      doAction(["format", "format_number", "format_number_auto"], env);
      expect(env.dispatch).toHaveBeenCalledWith("SET_FORMATTER", {
        sheet: env.getters.getActiveSheet(),
        target: env.getters.getSelectedZones(),
        formatter: "",
      });
    });

    test("Number", () => {
      doAction(["format", "format_number", "format_number_number"], env);
      expect(env.dispatch).toHaveBeenCalledWith("SET_FORMATTER", {
        sheet: env.getters.getActiveSheet(),
        target: env.getters.getSelectedZones(),
        formatter: "#,##0.00",
      });
    });

    test("Percent", () => {
      doAction(["format", "format_number", "format_number_percent"], env);
      expect(env.dispatch).toHaveBeenCalledWith("SET_FORMATTER", {
        sheet: env.getters.getActiveSheet(),
        target: env.getters.getSelectedZones(),
        formatter: "0.00%",
      });
    });

    test("Date", () => {
      doAction(["format", "format_number", "format_number_date"], env);
      expect(env.dispatch).toHaveBeenCalledWith("SET_FORMATTER", {
        sheet: env.getters.getActiveSheet(),
        target: env.getters.getSelectedZones(),
        formatter: "m/d/yyyy",
      });
    });
  });

  test("Format -> bold", () => {
    doAction(["format", "format_bold"], env);
    expect(env.dispatch).toHaveBeenCalledWith("SET_FORMATTING", {
      sheet: env.getters.getActiveSheet(),
      target: env.getters.getSelectedZones(),
      style: { bold: true },
    });
  });

  test("Format -> italic", () => {
    doAction(["format", "format_italic"], env);
    expect(env.dispatch).toHaveBeenCalledWith("SET_FORMATTING", {
      sheet: env.getters.getActiveSheet(),
      target: env.getters.getSelectedZones(),
      style: { italic: true },
    });
  });

  test("Format -> strikethrough", () => {
    doAction(["format", "format_strikethrough"], env);
    expect(env.dispatch).toHaveBeenCalledWith("SET_FORMATTING", {
      sheet: env.getters.getActiveSheet(),
      target: env.getters.getSelectedZones(),
      style: { strikethrough: true },
    });
  });

  test("Format -> font-size", () => {
    const fontSize = fontSizes[0];
    doAction(["format", "format_font_size", `format_font_size_${fontSize.pt}`], env);
    expect(env.dispatch).toHaveBeenCalledWith("SET_FORMATTING", {
      sheet: env.getters.getActiveSheet(),
      target: env.getters.getSelectedZones(),
      style: { fontSize: fontSize.pt },
    });
  });
});