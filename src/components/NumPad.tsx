"use client"

interface NumPadProps {
  value: string
  onChange: (v: string) => void
}

export default function NumPad({ value, onChange }: NumPadProps) {
  const press = (key: string) => {
    if (key === 'del') {
      onChange(value.slice(0, -1))
    } else if (key === 'C') {
      onChange('')
    } else if (key === '.') {
      if (!value.includes('.')) onChange(value + '.')
    } else {
      if (value === '0' && key !== '.') onChange(key)
      else onChange(value + key)
    }
  }

  const keys = [
    ['7', '8', '9', 'del'],
    ['4', '5', '6', 'C'],
    ['1', '2', '3', '.'],
    ['00', '0'],
  ]

  return (
    <div className="grid gap-1.5 px-2">
      {keys.map((row, ri) => (
        <div key={ri} className="flex gap-1.5">
          {row.map(k => (
            <button
              key={k}
              onClick={() => press(k)}
              className={`flex-1 h-12 rounded-lg text-lg font-semibold active:scale-95 transition-transform
                ${k === 'del' || k === 'C'
                  ? 'bg-gray-200 text-gray-600'
                  : 'bg-gray-100 text-gray-800'
                }
                ${k === '0' || k === '00' ? '' : ''}
              `}
            >
              {k === 'del' ? '⌫' : k}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
