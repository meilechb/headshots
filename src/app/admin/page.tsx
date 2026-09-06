import { redirect } from "next/navigation";

/** The studio opens on the client list. */
export default function AdminIndex() {
  redirect("/admin/clients");
}
