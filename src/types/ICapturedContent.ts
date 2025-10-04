export interface IPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface ILink {
  url: string
  text: string
}

export interface ICapturedContent {
  type: 'image' | 'video' | 'audio' | 'table' | 'code' | 'text'
  content: string
  html: string
  links: ILink[]
  position?: IPosition
  element?: HTMLElement
}