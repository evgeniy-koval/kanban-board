import * as Avatar from "@radix-ui/react-avatar"
import { User } from "@supabase/supabase-js"
import { Profile } from "@/lib/types"

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export const UserAvatar = ({ user }: { user: User | null }) => {
  const userMetadata = user?.user_metadata as Profile
  
  return (
    <Avatar.Root className="size-9 flex items-center justify-center">
      <Avatar.Image src={userMetadata.avatar_url} alt={userMetadata.full_name} />
      <Avatar.Fallback className="avatar-fallback" delayMs={300}>
        {getInitials(userMetadata.full_name)}
      </Avatar.Fallback>
    </Avatar.Root>
  )
}