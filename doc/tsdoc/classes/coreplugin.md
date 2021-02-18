[o-spreadsheet API](../README.md) / CorePlugin

# Class: CorePlugin<State, C\>

Core plugins handle spreadsheet data.
They are responsible to import, export and maintain the spreadsheet
persisted state.
They should not be concerned about UI parts or transient state.

## Type parameters

Name | Default |
------ | ------ |
`State` | *any* |
`C` | CoreCommand |

## Hierarchy

* *BasePlugin*<State, C\>

  ↳ **CorePlugin**

## Implements

* *RangeProvider*

## Table of contents

### Constructors

- [constructor](coreplugin.md#constructor)

### Properties

- [currentMode](coreplugin.md#currentmode)
- [dispatch](coreplugin.md#dispatch)
- [getters](coreplugin.md#getters)
- [history](coreplugin.md#history)
- [range](coreplugin.md#range)
- [getters](coreplugin.md#getters)
- [modes](coreplugin.md#modes)

### Methods

- [adaptRanges](coreplugin.md#adaptranges)
- [allowDispatch](coreplugin.md#allowdispatch)
- [beforeHandle](coreplugin.md#beforehandle)
- [export](coreplugin.md#export)
- [finalize](coreplugin.md#finalize)
- [handle](coreplugin.md#handle)
- [import](coreplugin.md#import)

## Constructors

### constructor

\+ **new CorePlugin**<State, C\>(`getters`: CoreGetters, `stateObserver`: *StateObserver*, `range`: *RangeAdapter*, `dispatch`: <T, C\>(`type`: {} *extends* *Pick*<C, *Exclude*<keyof C, *type*\>\> ? T : *never*) => CommandResult<T, C\>(`type`: T, `r`: *Pick*<C, *Exclude*<keyof C, *type*\>\>) => CommandResult, `config`: ModelConfig): [*CorePlugin*](coreplugin.md)<State, C\>

#### Type parameters:

Name | Default |
------ | ------ |
`State` | *any* |
`C` | CoreCommand |

#### Parameters:

Name | Type |
------ | ------ |
`getters` | CoreGetters |
`stateObserver` | *StateObserver* |
`range` | *RangeAdapter* |
`dispatch` | <T, C\>(`type`: {} *extends* *Pick*<C, *Exclude*<keyof C, *type*\>\> ? T : *never*) => CommandResult<T, C\>(`type`: T, `r`: *Pick*<C, *Exclude*<keyof C, *type*\>\>) => CommandResult |
`config` | ModelConfig |

**Returns:** [*CorePlugin*](coreplugin.md)<State, C\>

## Properties

### currentMode

• `Protected` **currentMode**: Mode

___

### dispatch

• `Protected` **dispatch**: <T, C\>(`type`: {} *extends* *Pick*<C, *Exclude*<keyof C, *type*\>\> ? T : *never*) => CommandResult<T, C\>(`type`: T, `r`: *Pick*<C, *Exclude*<keyof C, *type*\>\>) => CommandResult

___

### getters

• `Protected` **getters**: CoreGetters

___

### history

• `Protected` **history**: *WorkbookHistory*<State\>

___

### range

• `Protected` **range**: *RangeAdapter*

___

### getters

▪ `Static` **getters**: *string*[]

___

### modes

▪ `Static` **modes**: Mode[]

## Methods

### adaptRanges

▸ **adaptRanges**(`applyChange`: ApplyRangeChange, `sheetId?`: *string*): *void*

This method can be implemented in any plugin, to loop over the plugin's data structure and adapt the plugin's ranges.
To adapt them, the implementation of the function must have a perfect knowledge of the data structure, thus
implementing the loops over it makes sense in the plugin itself.
When calling the method applyChange, the range will be adapted if necessary, then a copy will be returned along with
the type of change that occurred.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`applyChange` | ApplyRangeChange | a function that, when called, will adapt the range according to the change on the grid   |
`sheetId?` | *string* | an optional sheetId to adapt either range of that sheet specifically, or ranges pointing to that sheet    |

**Returns:** *void*

___

### allowDispatch

▸ **allowDispatch**(`command`: C): CommandResult

Before a command is accepted, the model will ask each plugin if the command
is allowed.  If all of then return true, then we can proceed. Otherwise,
the command is cancelled.

There should not be any side effects in this method.

#### Parameters:

Name | Type |
------ | ------ |
`command` | C |

**Returns:** CommandResult

___

### beforeHandle

▸ **beforeHandle**(`command`: C): *void*

This method is useful when a plugin need to perform some action before a
command is handled in another plugin. This should only be used if it is not
possible to do the work in the handle method.

#### Parameters:

Name | Type |
------ | ------ |
`command` | C |

**Returns:** *void*

___

### export

▸ **export**(`data`: WorkbookData): *void*

#### Parameters:

Name | Type |
------ | ------ |
`data` | WorkbookData |

**Returns:** *void*

___

### finalize

▸ **finalize**(): *void*

Sometimes, it is useful to perform some work after a command (and all its
subcommands) has been completely handled.  For example, when we paste
multiple cells, we only want to reevaluate the cell values once at the end.

**Returns:** *void*

___

### handle

▸ **handle**(`command`: C): *void*

This is the standard place to handle any command. Most of the plugin
command handling work should take place here.

#### Parameters:

Name | Type |
------ | ------ |
`command` | C |

**Returns:** *void*

___

### import

▸ **import**(`data`: WorkbookData): *void*

#### Parameters:

Name | Type |
------ | ------ |
`data` | WorkbookData |

**Returns:** *void*