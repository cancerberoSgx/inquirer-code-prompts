import { GeneralNode, isDirectory, isSourceFile, getName } from 'ts-simple-ast-extra';

// TODO: move to -extra
export function getGeneralNodeKindName(c: GeneralNode) {
  return isDirectory(c) ? 'Directory' : c.getKindName()
}
export function getGeneralNodeName(c: GeneralNode) {
  return isDirectory(c) ? c.getBaseName() : isSourceFile(c) ? c.getBaseName() : getName(c) || c.getKindName()
}

// import { join, relative } from 'path'
// import { Directory, Project, SourceFile, Node, TypeGuards } from 'ts-morph'
// import { getChildrenForEachChild } from 'ts-simple-ast-extra';

// export function buildProject(options: { tsConfigFilePath: string }) {
//   const project = new Project({
//     tsConfigFilePath: options.tsConfigFilePath,
//     addFilesFromTsConfig: true
//   })
//   return project
// }

// export function checkFilesInProject(files: (File)[], project: Project) {
//   files.forEach(file => {
//     if (isSourceFile(file) && !project.getSourceFile(file.getFilePath())) {
//       throw `File ${file.getFilePath()} not found in project`
//     } else if (!isSourceFile(file) && !project.getDirectory(file.getPath())) {
//       throw `Directory ${file.getPath()} not found in project`
//     }
//   })
// }
// export type File = SourceFile|Directory
// export function getFileRelativePath(f: File, project: Project) {
//   const rootDir = project.getRootDirectories()[0]
//   return rootDir.getRelativePathTo(f as SourceFile)
// }
// export function getParent(f: File):File|undefined{
//     return isSourceFile(f) ? f.getDirectory() : f.getParent()
// }
// export function getBasePath(project: Project) {
//   const rootDir = project.getRootDirectories()[0]
//   return rootDir.getPath()
// }

// export function getAbsolutePath(relativePath: string, project: Project) {
//   return join(getBasePath(project), relativePath).replace(/\\/g, '/')
// }

// export function getRelativePath(path: string, project: Project) {
//   return relative(getBasePath(project), getAbsolutePath(path, project))
// }

// export function getFileFromRelativePath(path: string, project: Project) {
//   const rootDir = project.getRootDirectories()[0]
//   path = path.startsWith('./') ? path.substring(2) : path
//   return rootDir.getDirectory(path) || rootDir.getSourceFile(path)
// }

// export function getFilePath(f: File) {
//   return isSourceFile(f) ? f.getFilePath() : f.getPath()
// }

// export function isSourceFile(f: any): f is SourceFile {
//   return f && f.organizeImports
// }
// export function isDirectory(f: any): f is Directory {
//   return f && f.getDescendantSourceFiles && f.getDescendantDirectories
// }


// // generalNode : everything - directories, sourceFiles, and nodes. 
// export type GeneralNode = Node|Directory

// export function getGeneralChildren(f: GeneralNode): GeneralNode[]{
//   return isDirectory(f) ?( f.getDirectories() as GeneralNode[]).concat(f.getSourceFiles() as GeneralNode[]) :getChildrenForEachChild(f)
// }
// /** we will create a new semantic for non file node's paths */
// export function getGeneralPath(f:GeneralNode): string|undefined{

// }