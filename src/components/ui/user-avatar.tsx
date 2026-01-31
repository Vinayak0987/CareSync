import { cn } from '@/lib/utils';

interface UserAvatarProps {
    name: string;
    avatar?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
};

// Generate consistent color based on name
const getColorFromName = (name: string) => {
    const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-teal-500',
        'bg-orange-500',
        'bg-cyan-500',
        'bg-violet-500',
        'bg-emerald-500',
    ];

    const charCode = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
    return colors[charCode % colors.length];
};

// Get initials from name
const getInitials = (name: string) => {
    if (!name) return '?';

    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

export function UserAvatar({ name, avatar, size = 'md', className }: UserAvatarProps) {
    const initials = getInitials(name);
    const bgColor = getColorFromName(name);

    if (avatar) {
        return (
            <img
                src={avatar}
                alt={name}
                className={cn(
                    'rounded-full object-cover ring-2 ring-primary/10',
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                'rounded-full flex items-center justify-center font-semibold text-white',
                bgColor,
                sizeClasses[size],
                className
            )}
        >
            {initials}
        </div>
    );
}
