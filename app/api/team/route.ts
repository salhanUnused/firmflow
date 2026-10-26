import { inviteMember, updateMemberRole } from "@/lib/server/actions";
import { fail, json, requireSession } from "@/lib/server/http";
import type { UserRole } from "@/types";

export async function POST(request: Request) {
  try {
    const userId = await requireSession();
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      role?: UserRole;
      password?: string;
      title?: string;
    };
    if (!body.fullName || !body.email || !body.role || !body.password) {
      return json({ error: "Name, email, role and password are required." }, 400);
    }
    const member = await inviteMember(userId, {
      fullName: body.fullName,
      email: body.email,
      role: body.role,
      password: body.password,
      title: body.title,
    });
    return json({
      member: {
        id: member.id,
        email: member.email,
        fullName: member.fullName,
        role: member.role,
        title: member.title,
      },
    });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireSession();
    const body = (await request.json()) as { memberId?: string; role?: UserRole };
    if (!body.memberId || !body.role) {
      return json({ error: "Member and role are required." }, 400);
    }
    const member = await updateMemberRole(userId, body.memberId, body.role);
    return json({ member: { id: member.id, role: member.role } });
  } catch (error) {
    return fail(error);
  }
}
