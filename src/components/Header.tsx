interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <div className="w-full bg-gray-50 py-6 px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Designer Metals Logo */}
          <img 
            src="/Designer Metals Logo.png" 
            alt="Designer Metals Logo" 
            className="h-16 object-contain"
          />
        </div>
        <div className="flex items-center space-x-4">
          {/* Filters will be added here by the parent component */}
        </div>
      </div>
    </div>
  )
}
