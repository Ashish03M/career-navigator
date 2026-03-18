import coreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
    { ignores: [".claude/**", ".next/**"] },
    ...coreWebVitals,
];

export default config;
