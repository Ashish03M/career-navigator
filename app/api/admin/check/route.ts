import { isAuthenticatedFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const isAuthed = isAuthenticatedFromRequest(req);
        return Response.json({ authenticated: isAuthed });
    } catch {
        return Response.json({ authenticated: false });
    }
}
