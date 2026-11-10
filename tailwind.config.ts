import type { Config } from "tailwindcss";
const config: Config = { content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { ink:"#080b13", panel:"#101624", violet:"#9d8cff" }, fontFamily: { display:["Manrope","sans-serif"] } } }, plugins: [] };
export default config;