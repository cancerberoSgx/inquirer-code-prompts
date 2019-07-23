import * as ts from 'typescript'

export interface Options {
  code: string
  pageSize?: number
}
export interface ResultValue {
  selectedNodes: ts.Node[]
}

export interface Navigation {
  onUpKey(options: NavigationOptions): NavigationOptions
  onDownKey(options: NavigationOptions): NavigationOptions
  onLeftKey(options: NavigationOptions): NavigationOptions
  onRightKey(options: NavigationOptions): NavigationOptions
}

export interface NavigationOptions {
  currentInput: string
  navigableNativeNodes: ts.Node[]
  lastSelectedNode: ts.Node
  selectedNodeIndex: number
}
