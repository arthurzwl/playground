# 运动计时器开发约定

- 保持静态 HTML/CSS/JavaScript 实现，无需安装依赖，直接打开 `index.html` 即可使用。
- 在本目录运行容器检查：`docker compose run --rm check`。
- 本地预览：`docker compose up -d web`；停止预览：`docker compose down`。
- 无需编译；`check` 服务执行 JavaScript 语法检查和计时逻辑测试。
