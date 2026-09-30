import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "فيكسورا — إصلاح الموبايل في بيتك",
    short_name: "فيكسورا",
    description: "مهام الفني والإصلاح المنزلي — دعم أجهزة الموبايل.",
    start_url: "/technician",
    display: "standalone",
    background_color: "#fcfdfd",
    theme_color: "#0E8C89",
    lang: "ar",
    dir: "rtl",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}