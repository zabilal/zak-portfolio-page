import type { MetadataRoute } from "next";
import { domains } from "@/content/domains";
import { writtenNotes } from "@/content/notes";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/engineering",
    "/projects",
    "/lab",
    "/writing",
    "/experience",
    "/open-source",
    "/resume",
    "/contact",
    ...domains.map((d) => `/engineering/${d.id}`),
    ...projects.map((p) => `/projects/${p.slug}`),
    ...writtenNotes.map((n) => `/writing/${n.slug}`),
  ];
  return routes.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : path.split("/").length === 2 ? 0.8 : 0.6,
  }));
}
