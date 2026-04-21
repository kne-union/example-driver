### ExampleDriver
用于展示和编辑 React 组件示例的主组件，支持 LiveCode 和 MiniCode 两种展示模式。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| list | array | 是 | - | 示例列表数组，每个元素代表一个示例 |
| isFull | boolean | 否 | false | 是否全宽显示，true 时单列显示，false 时双列显示。当 list 仅有一项时自动为 true |
| contextComponent | React Component | 否 | - | 自定义上下文组件，用于包裹渲染的代码内容 |
| className | string | 否 | - | 自定义 CSS 类名 |
| ...props | object | 否 | - | 其他 HTML div 元素的属性 |

#### list 数组项属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 是 | - | 示例代码字符串 |
| scope | array | 是 | - | 作用域数组，包含组件和包信息 |
| title | string | 是 | - | 示例标题 |
| description | string | 是 | - | 示例描述，支持 HTML 格式 |
| qrcodeUrl | string | 否 | - | 二维码图片 URL，传入此项则使用 MiniCode 模式 |
| contextComponent | React Component | 否 | - | 单个示例的自定义上下文组件，优先级高于 ExampleDriver 的 contextComponent |
| mounted | boolean | 否 | - | 控制组件是否挂载。传入时由该值决定；不传时由视口检测决定是否挂载 |
| useInView | boolean | 否 | true | 是否启用视口检测懒加载，仅在 mounted 未传入时生效。设为 false 则组件始终挂载 |

#### scope 数组项属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| component | any | 否 | - | 要暴露给示例代码的组件，不传时仅生成 import 语句（如 CSS 导入） |
| name | string | 否 | - | 组件名称，在代码中使用。component 为真值且 name 为非空字符串时才注入到示例作用域 |
| packageName | string | 否 | - | 包名，用于生成导入语句 |
| importStatement | string | 否 | - | 自定义导入语句，提供后不再自动生成。优先级最高 |

### LiveCode
提供实时代码编辑和预览功能的子组件（通过 ExampleDriver 自动使用）。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 否 | '' | 要展示的代码 |
| scope | array | 否 | [] | 作用域数组 |
| title | string | 是 | - | 标题 |
| description | string | 是 | - | 描述，支持 HTML |
| contextComponent | React Component | 否 | - | 上下文组件，包裹渲染的示例内容 |
| mounted | boolean | 否 | - | 控制组件是否挂载。传入时由该值决定；不传时由视口检测决定 |
| useInView | boolean | 否 | true | 是否启用视口检测懒加载，仅在 mounted 未传入时生效 |

### MiniCode
显示二维码预览的只读模式子组件（通过 ExampleDriver 自动使用）。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 是 | - | 示例代码 |
| qrcodeUrl | string | 是 | - | 二维码图片地址 |
| scope | array | 是 | - | 作用域数组 |
| title | string | 是 | - | 标题 |
| description | string | 是 | - | 描述 |

### CodePanel
代码编辑面板子组件，用于显示和编辑代码。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 是 | - | 代码字符串 |
| scope | array | 是 | - | 作用域数组，用于生成 import 语句 |
| error | Error \| null | 否 | - | 编译错误对象 |
| editable | boolean | 是 | - | 代码是否可编辑 |
| onChange | function | 否 | - | 代码变更回调 `(newCode: string) => void` |

### DescriptionBar
示例描述栏子组件，显示标题、描述和代码面板切换按钮。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| title | string | 是 | - | 示例标题 |
| description | string | 是 | - | 示例描述，支持 HTML |
| codeOpen | boolean | 是 | - | 代码面板是否打开 |
| onToggle | function | 是 | - | 切换代码面板的回调 |

### HighlightCode
代码高亮展示子组件，使用 Prism 实现语法高亮。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 是 | - | 要高亮显示的代码字符串 |

### ErrorComponent
错误展示子组件，用于显示编译或运行时错误。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| error | string \| Error | 否 | - | 错误信息，字符串直接显示，Error 对象显示 .message |

### Hooks

#### useInView
视口检测 Hook，用于判断元素是否进入视口，实现懒加载。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| ref | React.RefObject | 是 | - | 要监听的 DOM 容器 ref |
| options | object | 否 | - | 配置选项 |
| options.disabled | boolean | 否 | false | 是否禁用视口检测 |

| 返回值 | 类型 | 说明 |
|--------|------|------|
| shouldRender | boolean | 元素是否在视口内 |
| heightRef | React.MutableRefObject\<number\> | 记录元素最后一次渲染高度的 ref |

内部使用全局共享的 IntersectionObserver 实例，rootMargin 为 200px 预加载，离开视口且 intersectionRatio 为 0 时卸载并保留占位高度。SSR 环境或浏览器不支持 IntersectionObserver 时直接返回 shouldRender 为 true。

#### useLazyCompile
懒编译 Hook，使用 Babel Standalone 在浏览器端编译代码，支持缓存和优先级调度。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 是 | - | 要编译的代码字符串 |
| shouldCompile | boolean | 是 | - | 是否应该编译，通常关联 useInView 的 shouldRender |

| 返回值 | 类型 | 说明 |
|--------|------|------|
| compiledCode | string \| null | 编译后的代码，未编译时为 null |
| error | Error \| null | 编译错误，无错误时为 null |

内部采用 LRU 缓存（上限 200 条），编译队列最大并发为 1。首次可见时作为优先任务立即编译，后续编辑变更走 debounce 500ms。非优先任务使用 requestIdleCallback 延迟执行。

#### useReactRoot
React Root 管理 Hook，使用 react-dom/client 的 createRoot API 管理组件挂载/卸载。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| containerRef | React.RefObject | 是 | - | 渲染容器 DOM ref |
| shouldRender | boolean | 是 | - | 是否应该渲染 |
| renderJsx | ReactNode \| null | 是 | - | 要渲染的 React 元素 |
| heightRef | React.MutableRefObject\<number\> | 是 | - | 用于记录/恢复高度的 ref |

卸载时将 runner 替换为 placeholder 并保留上次高度，使用 ResizeObserver 监控高度变化。组件卸载时自动清理。

### config
Monaco Editor 的配置方法，用于自定义编辑器加载行为。

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| config | options: { paths?: Record\<string, string\>, [key: string]: any } | void | 配置 Monaco Editor 的加载选项，最常用场景是通过 paths 自定义 Monaco 的 CDN 路径 |

### 国际化
内置中文（zh-CN）和英文（en-US）语言支持，默认语言为 zh-CN。

| Key | zh-CN | en-US |
|-----|-------|-------|
| CodePanel.loading | 正在加载代码编辑器... | Loading code editor... |
| MiniCode.example | 示例 | Example |
| MiniCode.scanQrcode | 请扫描二维码查看示例程序 | Please scan the QR code to view the example |
