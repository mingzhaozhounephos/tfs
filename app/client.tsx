'use client';
import { QueryResult, UserWithRoles } from "@/utils/supabase/server";
import { useSupabaseStore } from "@/utils/supabase/hooks";

export function Client({ userQueryResult }: { userQueryResult: QueryResult<UserWithRoles> }) {
  
  const { data: users } = useSupabaseStore<UserWithRoles>(userQueryResult);

  return (
    <div>
      <h1>Hello {users?.[0]?.full_name}</h1>
    </div>
  );
}