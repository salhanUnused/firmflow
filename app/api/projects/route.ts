import { createProject } from "@/lib/server/actions";
import { fail, json, requireSession } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const userId = await requireSession();
    const body = (await request.json()) as { name?: string; description?: string };
    if (!body.name) return json({ error: "Project name is required." }, 400);
    const project = await createProject(userId, {
      name: body.name,
      description: body.description ?? "",
    });
    return json({ project });
  } catch (error) {
    return fail(error);
  }
}
