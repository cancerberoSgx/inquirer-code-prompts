import { getChildren } from 'typescript-ast-util';
import { NavigationOptions, Navigation } from './types';

export class NavigationTreeLikeArrowNav implements Navigation {
  onUpKey(options: NavigationOptions) {
    if (!options.currentInput) {
      options.navigableNativeNodes = [
        ...getChildren(options.lastSelectedNode.parent && options.lastSelectedNode.parent.parent || options.lastSelectedNode.parent || options.lastSelectedNode)
      ];
    }
    options.selectedNodeIndex =
      options.selectedNodeIndex <= 0 ? options.navigableNativeNodes.length - 1 : options.selectedNodeIndex - 1;
    return options;
  }
  onDownKey(options: NavigationOptions) {
    if (!options.currentInput) {
      options.navigableNativeNodes = [
        ...getChildren(options.lastSelectedNode.parent).map(s => getChildren(s)).flat()
      ];
      options.selectedNodeIndex = 0;
    }
    options.selectedNodeIndex =
      options.selectedNodeIndex >= options.navigableNativeNodes.length - 1 ? 0 : options.selectedNodeIndex + 1;
    return options;
  }
  onLeftKey(options: NavigationOptions) {
    if (!options.currentInput) {
      const children = getChildren(options.lastSelectedNode.parent);
      if (children[0] === options.lastSelectedNode) {
        options.navigableNativeNodes = [
          ...getChildren(options.lastSelectedNode && options.lastSelectedNode.parent && options.lastSelectedNode.parent.parent || options.lastSelectedNode.parent || options.lastSelectedNode)
        ];
        options.selectedNodeIndex--;
      }
      else {
        options.selectedNodeIndex++;
      }
    }
    return options;
  }
  onRightKey(options: NavigationOptions) {
    if (!options.currentInput) {
      const children = getChildren(options.lastSelectedNode.parent);
      if (children[children.length - 1] === options.lastSelectedNode) {
        options.navigableNativeNodes = [
          ...getChildren(options.lastSelectedNode)
        ];
        options.selectedNodeIndex = 0;
      }
      else {
        options.selectedNodeIndex++;
      }
    }
    return options;
  }
}
