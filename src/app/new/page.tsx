import { permanentRedirect } from "next/navigation";

export default function NewJobRedirect() {
  permanentRedirect("/post-job");
}
