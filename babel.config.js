module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
    "@babel/preset-typescript",
  ],
  plugins: [
    [
      "module-resolver",
      {
        alias: {
          "@domain": "./src/domain",
          "@errors": "./src/errors",
          "@utils": "./src/utils",
          "@main": "./src/main",
          "@mock": "./src/tests/mock",
          "@gateway": "./src/gateway",
          "@infra": "./src/infra"
        },
      },
    ],
  ],
  ignore: ["./src/tests"],
};
