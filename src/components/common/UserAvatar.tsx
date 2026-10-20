import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthUser } from "@/features/auth/store/auth.store";
import { resolveImageUrl } from "@/lib/url";
import { cn } from "@/lib/utils";

const getInitials = (firstname = "", lastname = "", username = "") => {
  const initials = `${firstname.charAt(0)}${lastname.charAt(0)}`.trim();
  return (initials || username.slice(0, 2)).toUpperCase();
};

/** รูปโปรไฟล์ของผู้ใช้ที่ล็อกอินอยู่ ถ้าไม่มีรูปจะแสดงตัวอักษรย่อแทน */
const UserAvatar = ({ className }: { className?: string }) => {
  const user = useAuthUser();

  return (
    <Avatar className={cn("size-8", className)}>
      <AvatarImage src={resolveImageUrl(user?.image)} alt={user?.username ?? ""} />
      <AvatarFallback className="text-xs">
        {getInitials(user?.firstname, user?.lastname, user?.username)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
