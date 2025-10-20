import { redirect } from "next/navigation";

const FALLBACK_ROUTE = "/org/gg-hainfeld/projects/nachbarschaftszentrum-hainfeld";

export default function IndexPage() {
  const target = process.env.NEXT_PUBLIC_START_PROJECT ?? FALLBACK_ROUTE;
  redirect(target);
}
