# Spider Cloud CLI

Spider Cloud CLI 是一个用于快速创建和初始化 Spider Cloud 项目的命令行工具。它提供了直观的用户界面和丰富的项目模板，帮助开发者快速搭建项目框架。

## 特性

- 🚀 交互式项目创建向导
- 📦 多种项目类型支持 (PC, H5, IE, Mobile)
- 🎨 美观的命令行界面
- 🔄 实时进度显示
- ⚡️ 自动依赖管理
- 🛠 项目模板管理

## 安装

```bash
# 使用 npm
npm install -g spider-cloud-init

# 使用 yarn
yarn global add spider-cloud-init

# 使用 pnpm
pnpm add -g spider-cloud-init
```

## 使用方法

### 创建新项目

```bash
spider-cloud-init create
```

按照提示进行操作：
1. 选择是否在当前目录创建项目
2. 输入项目名称（如果不在当前目录创建）
3. 选择项目类型（支持多选）
4. 选择是否自动安装依赖

### 项目结构

创建的项目将包含以下基本结构：

```
your-project/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── main.ts
├── public/
├── package.json
└── README.md
```

## 开发

### 环境要求

- Node.js >= 14
- pnpm >= 6

### 本地开发

```bash
# 克隆仓库
git clone http://gitlab.cqlvc.com/spider-cloud/spider-cloud-cli.git

# 安装依赖
pnpm install

# 启动开发模式
pnpm dev

# 构建
pnpm build
```

### 项目结构

```
src/
├── commands/        # CLI 命令
├── utils/          # 工具函数
├── types.ts        # 类型定义
└── index.ts        # 入口文件
```

## 配置

Spider Cloud CLI 支持以下配置选项：

- `projectTypes`: 项目类型选项
  - PC
  - H5
  - IE
  - Mobile

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT](LICENSE)

***

# Editing this README

When you're ready to make this README your own, just edit this file and use the handy template below (or feel free to structure it however you want - this is just a starting point!). Thank you to [makeareadme.com](https://www.makeareadme.com/) for this template.

## Suggestions for a good README
Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name
Choose a self-explaining name for your project.

## Description
Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges
On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
