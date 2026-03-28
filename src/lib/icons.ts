import * as Icons from "lucide-react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getIcon(name: string): any {
  const iconsMap = Icons as any
  return iconsMap[name] || Icons.Circle
}
