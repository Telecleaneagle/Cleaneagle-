import type { Config } from "tailwindcss";
const config:Config={content:["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"],theme:{extend:{borderRadius:{xl:"1rem","2xl":"1.25rem"},boxShadow:{soft:"0 12px 28px rgba(0,0,0,.12)"}}},plugins:[]};
export default config;
