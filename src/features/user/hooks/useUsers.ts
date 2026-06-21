import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../service/user.service";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
  });
}
