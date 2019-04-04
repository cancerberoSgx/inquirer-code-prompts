import { prompt, registerPrompt } from 'inquirer'
import { Project } from 'ts-morph'
import { File, Fix } from '../../fix'

registerPrompt('checkbox-plus', require('inquirer-checkbox-plus-prompt'))

export async function inquireFiles(allFiles: File[], fix: Fix, project: Project): Promise<File[]> {
  const answers = await prompt<File[]>([
    {
      type: 'checkbox-plus',
      name: 'files',
      message: fix.selectFilesMessage || 'Select files',
      // @ts-ignore
      searchable: true,
      highlight: true,
      pageSize: 10,
      default: [allFiles[0]],
      validate(input, answers) {
        return (
          (fix.verifyInputFiles && fix.verifyInputFiles(answers ? answers : [], { project, inputFiles: [] })) || true
        )
      },
      // @ts-ignore
      source: function(answersSoFar: string[], input: string) {
        return Promise.resolve([
          { name: 'ALL', value: { name: '&ALL', isFolder: false } },
          ...allFiles.filter(f => f.name.includes(input)).map(f => ({ name: f.name, value: f }))
        ]) //TODO: add fuzzy  https://github.com/faressoft/inquirer-checkbox-plus-prompt
      }
    }
  ])
  if (answers.files.includes('&ALL')) {
    answers.files = allFiles
  }
  return answers.files
}
