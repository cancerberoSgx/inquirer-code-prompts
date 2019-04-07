import { Questions } from 'inquirer'
import { ResultValue } from './index'
let types
export interface KeyEvent {
  value: string
  key: {
    sequence: string
    name: string
    ctrl: boolean
    meta: boolean
    shift: boolean
  }
}
export interface InquirerBase<T extends ResultValue> {
  onKeypress(e?: KeyEvent): void
  render(error?: string): void
  getCurrentValue(): T
  render(error?: string): void
}
export declare class CustomBase {
  constructor(questions: Questions, rl: any, answers: any)
  opt: any
  throwParamError(s: string): void
  screen: {
    done(): void
    render(message: string, c: string): void
  }
  handleSubmitEvents(e: any): any
  rl: any
  status: string
  answer: any
  //  render()
  //  this.screen.done()
  // this.log(state, state.value)
  //  this.done(state.value)
  done(value: any): void
}
