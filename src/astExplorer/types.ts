import * as ts from 'typescript'

export interface Options {
  code: string;
  pageSize?: number;
}
export interface ResultValue {
  selectedNodes: ts.Node[];
}
