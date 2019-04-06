import { Fix, FIX, FixOptions } from './fix'
import { moveFileFix } from './fix/moveFile'
import { organizeImportsFix } from './fix/organizeImports'
import { formatFix } from './fix/format'
import { removeUnusedFix } from './fix/removeUnused'

const fixes: Fix<FixOptions>[] = []

export function registerFix(fix: Fix) {
  fixes.push(fix)
}

export function getFixes() {
  return fixes
}

export function getFix(name: FIX) {
  return fixes.find(f => f.name.toString() == name.toString())
}

registerFix(organizeImportsFix)
registerFix(moveFileFix)
registerFix(formatFix)
registerFix(removeUnusedFix)
