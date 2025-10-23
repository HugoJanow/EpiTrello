interface User {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
}

interface AvatarProps {
  user: User;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

/**
 * Generate a stable color from a string
 */
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

/**
 * Get initials from display name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0]!.substring(0, 2).toUpperCase();
  }
  const first = parts[0]?.[0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return (first + last).toUpperCase();
}

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
};

export function Avatar({ user, size = 'md' }: AvatarProps) {
  const backgroundColor = stringToColor(user.displayName);
  const initials = getInitials(user.displayName);

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.displayName}
        title={user.displayName}
        className={`${sizes[size]} rounded-full object-cover border-2 border-white`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-medium border-2 border-white`}
      style={{ backgroundColor }}
      title={user.displayName}
      role="img"
      aria-label={user.displayName}
    >
      {initials}
    </div>
  );
}
