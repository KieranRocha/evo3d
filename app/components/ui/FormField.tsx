export function FormField({
    label,
    name,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    icon,
    required = false,
    disabled = false,
    className = "",
}: {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    icon?: React.ReactNode;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <div className={`mb-4 ${className}`}>
            <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    id={name}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`
              w-full rounded-md border ${error ? 'border-red-300' : 'border-gray-300'} 
              ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 
              focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-200' : 'focus:ring-primary-200'} 
              focus:border-primary transition-colors
              ${disabled ? 'bg-gray-100 text-gray-500' : ''}
            `}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}